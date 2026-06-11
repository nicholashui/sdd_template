// git.mjs
// Thin, safe wrapper around the git CLI.
//
// SECURITY: This module only clones, fetches, fast-forwards, and reads metadata.
// It never runs install scripts, hooks, or arbitrary commands from downloaded
// repositories. All commands are executed with execFileSync (no shell), so
// untrusted strings cannot be interpreted by a shell.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function run(args, opts = {}) {
  const out = execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  });
  // When stdout is inherited (e.g. clone/update), execFileSync returns null.
  return out == null ? '' : out.toString().trim();
}

/** True if the git CLI is available. */
export function isGitAvailable() {
  try {
    run(['--version']);
    return true;
  } catch {
    return false;
  }
}

/** Return git version string, or null. */
export function gitVersion() {
  try {
    return run(['--version']);
  } catch {
    return null;
  }
}

/** True if `dir` contains a git repository. */
export function isGitRepo(dir) {
  return fs.existsSync(path.join(dir, '.git'));
}

/**
 * Shallow clone a repository.
 * @param {string} url
 * @param {string} target absolute path
 */
export function clone(url, target, { depth = 1 } = {}) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  run(['clone', '--depth', String(depth), url, target], { stdio: 'inherit' });
}

/**
 * Fetch and fast-forward an existing repository.
 * @param {string} target absolute path to repo
 */
export function update(target, { depth = 1 } = {}) {
  run(['-C', target, 'fetch', '--depth', String(depth), 'origin'], { stdio: 'inherit' });
  // Fast-forward only; never merge or rebase to avoid surprising mutations.
  run(['-C', target, 'pull', '--ff-only'], { stdio: 'inherit' });
}

function safeRead(args) {
  try {
    return run(args);
  } catch {
    return null;
  }
}

/**
 * Read metadata for a downloaded repository.
 * @param {string} target absolute path to repo
 */
export function metadata(target) {
  return {
    resolved_url: safeRead(['-C', target, 'remote', 'get-url', 'origin']),
    commit: safeRead(['-C', target, 'rev-parse', 'HEAD']),
    branch: safeRead(['-C', target, 'branch', '--show-current']),
    last_commit_at: safeRead(['-C', target, 'log', '-1', '--format=%cI']),
    last_commit_subject: safeRead(['-C', target, 'log', '-1', '--format=%s']),
  };
}

export default {
  isGitAvailable,
  gitVersion,
  isGitRepo,
  clone,
  update,
  metadata,
};
