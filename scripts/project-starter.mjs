#!/usr/bin/env node
// project-starter.mjs
// Top-level command router for the sdd_template starter repository.
//
// Commands:
//   bootstrap  doctor -> sources:download -> sources:audit -> security -> sync --dry-run -> test
//   create     scaffold a new downstream project (delegates to create-project.mjs)
//   init       ensure the required directory structure exists
//   format     normalize JSON manifests (pretty-print, stable)

import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import {
  PROJECT_ROOT,
  ensureDir,
  exists,
  readJson,
  writeJson,
  listDir,
} from './lib/fs-safe.mjs';
import { header, ok, fail, step, info, line } from './lib/report.mjs';

const REQUIRED_DIRS = [
  'sources',
  'external/sources',
  'scripts/adapters',
  'scripts/lib',
  'rules',
  'skills',
  'hooks/scripts',
  'mcp-configs/optional',
  'memory/reflections',
  'reviews',
  'suggestions/pending',
  'suggestions/approved',
  'suggestions/rejected',
  'docs',
  'tests/fixtures',
];

// Each step runs a node script directly (no nested npm) for speed and clarity.
// `args` may be an array or a function returning an array (resolved at run time).
const BOOTSTRAP_STEPS = [
  { name: 'doctor', args: ['scripts/doctor.mjs'] },
  { name: 'sources:download', args: ['scripts/source-download.mjs'] },
  { name: 'sources:audit', args: ['scripts/source-audit.mjs'] },
  { name: 'security', args: ['scripts/security.mjs'] },
  { name: 'sync --dry-run', args: ['scripts/sync.mjs', '--dry-run'] },
  { name: 'test', args: resolveTestArgs },
];

// Build an explicit list of first-party test files. We never let the test runner
// auto-discover files, because that would recurse into untrusted external/sources.
function resolveTestArgs() {
  const files = listDir('tests')
    .filter((f) => f.endsWith('.test.mjs'))
    .sort()
    .map((f) => `tests/${f}`);
  return ['--test', ...files];
}

function runNode(args) {
  execFileSync(process.execPath, args, { cwd: PROJECT_ROOT, stdio: 'inherit' });
}

function cmdBootstrap() {
  header('sdd_template bootstrap');
  const results = {};
  for (const stepDef of BOOTSTRAP_STEPS) {
    line();
    step(`bootstrap: ${stepDef.name}`);
    const args = typeof stepDef.args === 'function' ? stepDef.args() : stepDef.args;
    try {
      runNode(args);
      results[stepDef.name] = 'pass';
    } catch (err) {
      results[stepDef.name] = 'fail';
      line();
      fail(`bootstrap step failed: ${stepDef.name}`);
      printSummary(results);
      return 1;
    }
  }
  line();
  printSummary(results);
  ok('bootstrap complete');
  return 0;
}

function printSummary(results) {
  header('bootstrap summary');
  for (const [k, v] of Object.entries(results)) {
    if (v === 'pass') ok(`${k}: pass`);
    else fail(`${k}: fail`);
  }
}

function cmdCreate(argv) {
  // Delegate to create-project.mjs with the same arguments.
  step('delegating to create-project.mjs');
  try {
    runNode(['scripts/create-project.mjs', ...argv]);
    return 0;
  } catch {
    return 1;
  }
}

function cmdInit() {
  header('sdd_template init');
  for (const dir of REQUIRED_DIRS) {
    ensureDir(dir);
    info(`ensured ${dir}/`);
  }
  ok('init complete');
  return 0;
}

function cmdFormat() {
  header('sdd_template format');
  const jsonTargets = [
    'package.json',
    'sources/manifest.json',
    'sources/docs-manifest.json',
    'rules/manifest.json',
    'skills/manifest.json',
    'hooks/manifest.json',
    'mcp-configs/manifest.json',
    'mcp-configs/minimal.json',
  ];
  let count = 0;
  for (const t of jsonTargets) {
    if (exists(t)) {
      try {
        const data = readJson(t);
        writeJson(t, data);
        info(`formatted ${t}`);
        count += 1;
      } catch (err) {
        fail(`could not format ${t}: ${err.message}`);
      }
    }
  }
  ok(`format complete (${count} file(s))`);
  return 0;
}

export function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  switch (command) {
    case 'bootstrap':
      return cmdBootstrap();
    case 'create':
      return cmdCreate(rest);
    case 'init':
      return cmdInit();
    case 'format':
      return cmdFormat();
    default:
      header('sdd_template');
      info('Usage: node scripts/project-starter.mjs <bootstrap|create|init|format>');
      return command ? 1 : 0;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
