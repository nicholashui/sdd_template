#!/usr/bin/env node
// doctor.mjs
// Environment preflight checks for the bootstrap pipeline.

import os from 'node:os';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { isGitAvailable, gitVersion } from './lib/git.mjs';
import {
  PROJECT_ROOT,
  exists,
  ensureDir,
  canWrite,
} from './lib/fs-safe.mjs';
import { header, ok, fail, warn, summary, line } from './lib/report.mjs';

const MIN_NODE_MAJOR = 20;

export function checkNode() {
  const major = Number(process.versions.node.split('.')[0]);
  return { ok: major >= MIN_NODE_MAJOR, detail: `v${process.versions.node}` };
}

export function checkGit() {
  const available = isGitAvailable();
  return { ok: available, detail: available ? gitVersion() : 'not found' };
}

export function checkManifest() {
  const present = exists('sources/manifest.json');
  return { ok: present, detail: present ? 'sources/manifest.json' : 'missing' };
}

export function checkExternal() {
  try {
    ensureDir('external/sources');
    return { ok: true, detail: 'external/sources ready' };
  } catch (err) {
    return { ok: false, detail: err.message };
  }
}

export function checkScripts() {
  const present = exists('scripts');
  return { ok: present, detail: present ? 'scripts/' : 'missing' };
}

export function checkWritable() {
  const writable = canWrite('.');
  return { ok: writable, detail: writable ? 'writable' : 'not writable' };
}

export function checkSymlink() {
  // Symlink support is optional (sync defaults to copy mode).
  return { ok: true, detail: process.platform === 'win32' ? 'limited (win32)' : 'supported' };
}

export function runDoctor() {
  header('sdd_template doctor');

  const node = checkNode();
  const git = checkGit();
  const manifest = checkManifest();
  const external = checkExternal();
  const scripts = checkScripts();
  const writable = checkWritable();
  const symlink = checkSymlink();

  const result = node.ok && git.ok && manifest.ok && external.ok && scripts.ok && writable.ok;

  summary({
    Node: `${node.ok ? 'OK' : 'FAIL'} (${node.detail})`,
    Git: `${git.ok ? 'OK' : 'FAIL'} (${git.detail})`,
    Manifest: `${manifest.ok ? 'OK' : 'FAIL'} (${manifest.detail})`,
    'External dir': `${external.ok ? 'OK' : 'FAIL'} (${external.detail})`,
    Scripts: `${scripts.ok ? 'OK' : 'FAIL'} (${scripts.detail})`,
    Writable: `${writable.ok ? 'OK' : 'FAIL'} (${writable.detail})`,
    Symlink: `${symlink.detail}`,
    OS: `${os.platform()} ${os.release()}`,
    Cwd: PROJECT_ROOT,
  });

  line();
  if (result) {
    ok('Result: OK');
  } else {
    if (!node.ok) fail(`Node >= ${MIN_NODE_MAJOR} required, found ${node.detail}`);
    if (!git.ok) fail('Git is required but was not found on PATH');
    if (!manifest.ok) fail('sources/manifest.json is missing');
    if (!external.ok) fail(`Cannot create external/: ${external.detail}`);
    if (!writable.ok) fail('Project directory is not writable');
    fail('Result: FAIL');
  }
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const passed = runDoctor();
  process.exit(passed ? 0 : 1);
}
