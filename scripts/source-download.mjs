#!/usr/bin/env node
// source-download.mjs
// Download (clone/update) enabled upstream GitHub sources listed in
// sources/manifest.json into external/sources/, then write sources/source-lock.json.
//
// SECURITY: This script ONLY clones/updates repositories and reads git metadata
// and directory listings. It never executes any downloaded code, never runs
// npm install inside a source, and never copies source content into agent configs.

import process from 'node:process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import * as git from './lib/git.mjs';
import {
  PROJECT_ROOT,
  resolveInRoot,
  exists,
  isDir,
  ensureDir,
  listDir,
  writeJson,
} from './lib/fs-safe.mjs';
import {
  loadManifest,
  validateManifest,
  selectSources,
  LOCK_PATH,
} from './lib/manifest.mjs';
import { header, step, ok, warn, fail, info, summary, line } from './lib/report.mjs';

const LICENSE_PATTERNS = [/^LICENSE/i, /^COPYING/i, /^LICENCE/i, /^UNLICENSE/i];
const PACKAGE_FILE_NAMES = [
  'package.json',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'Gemfile',
  'composer.json',
  'requirements.txt',
];

export function parseArgs(argv) {
  const args = {
    update: false,
    check: false,
    dryRun: false,
    strict: false,
    profile: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--update') args.update = true;
    else if (a === '--check') args.check = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--profile') {
      args.profile = argv[i + 1];
      i += 1;
    } else if (a.startsWith('--profile=')) {
      args.profile = a.split('=')[1];
    }
  }
  return args;
}

function detectFiles(targetRel) {
  const entries = listDir(targetRel);
  const license_files = entries.filter((e) => LICENSE_PATTERNS.some((re) => re.test(e)));
  const package_files = entries.filter((e) => PACKAGE_FILE_NAMES.includes(e));
  return { license_files, package_files };
}

function lockEntry(src, status, extra = {}) {
  return {
    id: src.id,
    name: src.name,
    url: src.url,
    resolved_url: extra.resolved_url || src.url,
    target: src.target,
    status,
    commit: extra.commit || null,
    branch: extra.branch || null,
    last_commit_at: extra.last_commit_at || null,
    last_commit_subject: extra.last_commit_subject || null,
    license_files: extra.license_files || [],
    package_files: extra.package_files || [],
    quarantine: src.quarantine === true,
    import_policy: src.import_policy,
    priority: src.priority,
    tier: src.tier,
    warnings: extra.warnings || [],
    error: extra.error || null,
  };
}

/**
 * Download a single source. Returns a lock entry.
 * Throws only for fatal (required) failures so the caller can abort.
 */
function downloadOne(src, args) {
  const targetRel = src.target;
  const targetAbs = resolveInRoot(targetRel);
  const present = exists(targetRel);
  const warnings = [];

  if (args.dryRun) {
    const action = present ? 'would update' : 'would clone';
    info(`${action}: ${src.id} <- ${src.url}`);
    return lockEntry(src, 'dry-run', { warnings });
  }

  if (args.check) {
    if (!present) {
      info(`${src.id}: not downloaded`);
      return lockEntry(src, 'missing', { warnings });
    }
    if (!git.isGitRepo(targetAbs)) {
      info(`${src.id}: present but not a git repo`);
      return lockEntry(src, 'invalid', { warnings });
    }
    const meta = git.metadata(targetAbs);
    const files = detectFiles(targetRel);
    info(`${src.id}: present @ ${String(meta.commit).slice(0, 8)}`);
    return lockEntry(src, 'present', { ...meta, ...files, warnings });
  }

  try {
    if (!present) {
      step(`clone ${src.id} <- ${src.url}`);
      git.clone(src.url, targetAbs, { depth: 1 });
    } else if (git.isGitRepo(targetAbs)) {
      if (args.update) {
        step(`update ${src.id}`);
        git.update(targetAbs, { depth: 1 });
      } else {
        info(`${src.id}: already present (use --update to refresh)`);
      }
    } else {
      // present but not a git repo => fatal per spec section 7.2
      throw new Error(`target exists but is not a git repository: ${targetRel}`);
    }

    const meta = git.metadata(targetAbs);
    const files = detectFiles(targetRel);

    if (meta.resolved_url && normalizeUrl(meta.resolved_url) !== normalizeUrl(src.url)) {
      warnings.push(`remote redirected to ${meta.resolved_url}`);
    }

    ok(`${src.id} @ ${String(meta.commit).slice(0, 8)} (${meta.branch || 'detached'})`);
    return lockEntry(src, 'downloaded', { ...meta, ...files, warnings });
  } catch (err) {
    return lockEntry(src, 'failed', { warnings, error: err.message });
  }
}

function normalizeUrl(u) {
  return String(u).replace(/\.git$/, '').replace(/\/$/, '').toLowerCase();
}

export function runDownload(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  header('sdd_template sources:download');

  const manifest = loadManifest();
  const validation = validateManifest(manifest);
  if (!validation.ok) {
    for (const e of validation.errors) fail(e);
    fail('manifest validation failed');
    return { code: 1 };
  }
  ok('manifest validation passed');

  const profile = args.profile || manifest.default_profile || 'all';
  const sources = selectSources(manifest, { profile });
  step(`profile "${profile}" selected ${sources.length} enabled source(s)`);

  if (!args.dryRun && !args.check) {
    ensureDir(manifest.download_root || 'external/sources');
    if (!git.isGitAvailable()) {
      fail('git is not available; cannot download sources');
      return { code: 1 };
    }
  }

  const lockSources = [];
  const failures = [];

  for (const src of sources) {
    const entry = downloadOne(src, args);
    lockSources.push(entry);
    if (entry.status === 'failed') {
      failures.push({ id: src.id, priority: src.priority, error: entry.error });
      if (src.priority === 'required') {
        fail(`required source failed: ${src.id} — ${entry.error}`);
      } else if (args.strict) {
        fail(`optional source failed (strict): ${src.id} — ${entry.error}`);
      } else {
        warn(`optional source failed: ${src.id} — ${entry.error}`);
      }
    }
  }

  // Write/refresh the lock file (skip writes on pure --check to avoid churn? we still write for accuracy).
  const lock = {
    schema_version: '1.0',
    generated_at: new Date().toISOString(),
    profile,
    download_root: manifest.download_root || 'external/sources',
    sources: lockSources,
    failures,
  };

  if (!args.dryRun) {
    writeJson(LOCK_PATH, lock);
    ok(`wrote ${LOCK_PATH}`);
  } else {
    info('dry-run: lock file not written');
  }

  const counts = {
    selected: sources.length,
    downloaded: lockSources.filter((s) => s.status === 'downloaded').length,
    present: lockSources.filter((s) => s.status === 'present').length,
    dryRun: lockSources.filter((s) => s.status === 'dry-run').length,
    failed: failures.length,
  };

  line();
  summary({
    Profile: profile,
    Selected: counts.selected,
    Downloaded: counts.downloaded,
    Present: counts.present,
    Failed: counts.failed,
  });

  const requiredFailures = failures.filter((f) => f.priority === 'required');
  const strictFailures = args.strict ? failures : requiredFailures;

  if (strictFailures.length > 0) {
    line();
    fail(`${strictFailures.length} fatal source failure(s)`);
    for (const f of strictFailures) info(`${f.id}: ${f.error}`);
    return { code: 1, lock };
  }

  line();
  ok('sources:download complete');
  return { code: 0, lock };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code } = runDownload();
  process.exit(code);
}
