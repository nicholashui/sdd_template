#!/usr/bin/env node
// security.mjs
// Static security smoke checks. NEVER executes downloaded code.
//
// Checks:
//   1. Suspicious root-level scripts in downloaded sources.
//   2. Secrets (.env, private keys, tokens, certs) committed into first-party dirs.
//   3. MCP configs that grant broad filesystem/network access.
//   4. Remote pipe-to-shell patterns (curl|bash, irm|iex) and npm install hooks.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import {
  PROJECT_ROOT,
  resolveInRoot,
  exists,
  listDir,
  readJson,
} from './lib/fs-safe.mjs';
import { header, ok, warn, fail, info, summary, line } from './lib/report.mjs';

const SOURCES_DIR = 'external/sources';

// First-party directories that must never contain secrets.
const FIRST_PARTY_DIRS = ['rules', 'skills', 'hooks', 'mcp-configs', 'docs', 'scripts', 'sources', 'memory'];

const SECRET_FILE_PATTERNS = [
  /^\.env(\..+)?$/i,
  /\.pem$/i,
  /\.key$/i,
  /\.pfx$/i,
  /\.p12$/i,
  /id_rsa$/i,
  /id_ed25519$/i,
];

const REMOTE_PIPE_PATTERNS = [
  /curl\s+[^|]*\|\s*(sudo\s+)?(ba)?sh/i,
  /wget\s+[^|]*\|\s*(sudo\s+)?(ba)?sh/i,
  /iwr\s+.*\|\s*iex/i,
  /irm\s+.*\|\s*iex/i,
];

const INSTALL_HOOKS = ['preinstall', 'install', 'postinstall'];

function walk(relDir, { maxDepth = 4, depth = 0 } = {}) {
  const out = [];
  if (!exists(relDir)) return out;
  let entries;
  try {
    entries = fs.readdirSync(resolveInRoot(relDir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const child = path.posix.join(relDir, e.name);
    if (e.isDirectory()) {
      if (depth < maxDepth) out.push(...walk(child, { maxDepth, depth: depth + 1 }));
    } else {
      out.push(child);
    }
  }
  return out;
}

export function scanDownloadedSources() {
  const findings = [];
  if (!exists(SOURCES_DIR)) return findings;

  for (const id of listDir(SOURCES_DIR)) {
    const repoRel = `${SOURCES_DIR}/${id}`;
    if (!fs.statSync(resolveInRoot(repoRel)).isDirectory()) continue;
    const entries = listDir(repoRel);

    // package.json install hooks
    if (entries.includes('package.json')) {
      try {
        const pkg = readJson(`${repoRel}/package.json`);
        const scripts = pkg.scripts || {};
        for (const hook of INSTALL_HOOKS) {
          if (scripts[hook]) {
            findings.push({
              level: 'warn',
              where: `${repoRel}/package.json`,
              msg: `defines "${hook}" script (do not run npm install here)`,
            });
          }
        }
      } catch {
        // ignore untrusted parse errors
      }
    }

    // root-level installer scripts + remote pipe-to-shell
    for (const name of entries) {
      if (/\.(sh|bash|ps1)$/i.test(name)) {
        const fileRel = `${repoRel}/${name}`;
        let body = '';
        try {
          body = fs.readFileSync(resolveInRoot(fileRel), 'utf8');
        } catch {
          body = '';
        }
        if (REMOTE_PIPE_PATTERNS.some((re) => re.test(body))) {
          findings.push({
            level: 'warn',
            where: fileRel,
            msg: 'contains a remote pipe-to-shell pattern (never execute)',
          });
        }
      }
    }
  }
  return findings;
}

export function scanFirstPartySecrets() {
  const findings = [];
  for (const dir of FIRST_PARTY_DIRS) {
    for (const fileRel of walk(dir)) {
      const base = path.basename(fileRel);
      if (SECRET_FILE_PATTERNS.some((re) => re.test(base))) {
        findings.push({
          level: 'fail',
          where: fileRel,
          msg: 'looks like a committed secret/credential file',
        });
      }
    }
  }
  return findings;
}

export function scanMcpConfigs() {
  const findings = [];
  const mcpDir = 'mcp-configs';
  if (!exists(mcpDir)) return findings;

  for (const fileRel of walk(mcpDir)) {
    if (!fileRel.endsWith('.json')) continue;
    let cfg;
    try {
      cfg = readJson(fileRel);
    } catch {
      continue;
    }
    const text = JSON.stringify(cfg);
    if (/"\/"/.test(text) || /filesystem.*["']\/["']/i.test(text) || /"--allow-root"/.test(text)) {
      findings.push({
        level: 'warn',
        where: fileRel,
        msg: 'MCP config may grant broad filesystem access',
      });
    }
  }
  return findings;
}

export function runSecurity() {
  header('sdd_template security');
  info('Static scan only — downloaded code is never executed.');

  const sourceFindings = scanDownloadedSources();
  const secretFindings = scanFirstPartySecrets();
  const mcpFindings = scanMcpConfigs();

  const all = [...sourceFindings, ...secretFindings, ...mcpFindings];
  const fails = all.filter((f) => f.level === 'fail');
  const warns = all.filter((f) => f.level === 'warn');

  for (const f of warns) warn(`${f.where}: ${f.msg}`);
  for (const f of fails) fail(`${f.where}: ${f.msg}`);

  line();
  summary({
    'Downloaded-source warnings': sourceFindings.length,
    'First-party secret findings': secretFindings.length,
    'MCP config warnings': mcpFindings.length,
    'Critical findings': fails.length,
  });

  line();
  if (fails.length > 0) {
    fail(`security: ${fails.length} critical finding(s)`);
    return { code: 1 };
  }
  ok(`security: pass (${warns.length} advisory warning(s))`);
  return { code: 0 };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code } = runSecurity();
  process.exit(code);
}
