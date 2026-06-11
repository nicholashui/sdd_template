// source-download.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { parseArgs } from '../scripts/source-download.mjs';
import { exists, readJson } from '../scripts/lib/fs-safe.mjs';
import { LOCK_PATH } from '../scripts/lib/manifest.mjs';

test('parseArgs recognizes flags and profile', () => {
  const a = parseArgs(['--update', '--strict', '--profile', 'core']);
  assert.equal(a.update, true);
  assert.equal(a.strict, true);
  assert.equal(a.profile, 'core');

  const b = parseArgs(['--dry-run', '--profile=official']);
  assert.equal(b.dryRun, true);
  assert.equal(b.profile, 'official');

  const c = parseArgs(['--check']);
  assert.equal(c.check, true);
  assert.equal(c.update, false);
});

test('source-lock.json has a valid shape when present', () => {
  if (!exists(LOCK_PATH)) {
    // Lock is produced by `sources:download`; skip if not yet generated.
    return;
  }
  const lock = readJson(LOCK_PATH);
  assert.equal(typeof lock.schema_version, 'string');
  assert.equal(typeof lock.generated_at, 'string');
  assert.ok(Array.isArray(lock.sources));
  assert.ok(Array.isArray(lock.failures));

  for (const entry of lock.sources) {
    assert.ok(entry.id, 'lock entry missing id');
    assert.ok(entry.url, 'lock entry missing url');
    assert.ok(entry.target, 'lock entry missing target');
    assert.ok(typeof entry.status === 'string', 'lock entry missing status');
    assert.ok('import_policy' in entry, 'lock entry missing import_policy');
  }
});
