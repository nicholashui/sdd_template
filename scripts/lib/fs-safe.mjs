// fs-safe.mjs
// Safe filesystem helpers. All write operations are constrained to the project
// root so scripts can never write outside the repository.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Project root is two levels up from scripts/lib/.
export const PROJECT_ROOT = path.resolve(here, '..', '..');

/**
 * Resolve a path relative to the project root and assert it stays inside it.
 * @param {string} relOrAbs
 * @returns {string} absolute path inside the project root
 */
export function resolveInRoot(relOrAbs) {
  const abs = path.resolve(PROJECT_ROOT, relOrAbs);
  const rel = path.relative(PROJECT_ROOT, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Refusing to access path outside project root: ${relOrAbs}`);
  }
  return abs;
}

/** True if a path exists. */
export function exists(p) {
  try {
    fs.accessSync(resolveInRoot(p));
    return true;
  } catch {
    return false;
  }
}

/** True if a path is a directory. */
export function isDir(p) {
  try {
    return fs.statSync(resolveInRoot(p)).isDirectory();
  } catch {
    return false;
  }
}

/** Create a directory (recursively) inside the project root. */
export function ensureDir(p) {
  const abs = resolveInRoot(p);
  fs.mkdirSync(abs, { recursive: true });
  return abs;
}

/** Read a UTF-8 text file. */
export function readText(p) {
  return fs.readFileSync(resolveInRoot(p), 'utf8');
}

/** Write a UTF-8 text file, creating parent directories as needed. */
export function writeText(p, content) {
  const abs = resolveInRoot(p);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  return abs;
}

/** Read and parse a JSON file. */
export function readJson(p) {
  return JSON.parse(readText(p));
}

/** Serialize and write a JSON file with a trailing newline. */
export function writeJson(p, data) {
  return writeText(p, `${JSON.stringify(data, null, 2)}\n`);
}

/** List directory entries (names only). Returns [] if missing. */
export function listDir(p) {
  try {
    return fs.readdirSync(resolveInRoot(p));
  } catch {
    return [];
  }
}

/** Check writability of the project root (or a sub path). */
export function canWrite(p = '.') {
  try {
    fs.accessSync(resolveInRoot(p), fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export default {
  PROJECT_ROOT,
  resolveInRoot,
  exists,
  isDir,
  ensureDir,
  readText,
  writeText,
  readJson,
  writeJson,
  listDir,
  canWrite,
};
