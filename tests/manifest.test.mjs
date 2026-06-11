// manifest.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  loadManifest,
  validateManifest,
  selectSources,
} from '../scripts/lib/manifest.mjs';

test('manifest parses and validates', () => {
  const manifest = loadManifest();
  const { ok, errors } = validateManifest(manifest);
  assert.equal(ok, true, `validation errors: ${errors.join(', ')}`);
});

test('every enabled source has required fields', () => {
  const manifest = loadManifest();
  const required = ['id', 'url', 'target', 'priority', 'tier', 'import_policy'];
  for (const src of manifest.sources.filter((s) => s.enabled)) {
    for (const field of required) {
      assert.ok(
        src[field] !== undefined && src[field] !== null && src[field] !== '',
        `source ${src.id || '?'} missing ${field}`,
      );
    }
  }
});

test('no duplicate source ids', () => {
  const manifest = loadManifest();
  const ids = manifest.sources.map((s) => s.id);
  const unique = new Set(ids);
  assert.equal(unique.size, ids.length, 'duplicate source ids detected');
});

test('every target starts with external/sources/', () => {
  const manifest = loadManifest();
  for (const src of manifest.sources) {
    assert.ok(
      src.target.startsWith('external/sources/'),
      `target ${src.target} does not start with external/sources/`,
    );
  }
});

test('archived/disabled sources are not selected by default', () => {
  const manifest = loadManifest();
  const selected = selectSources(manifest, { profile: 'all' });
  const ids = selected.map((s) => s.id);
  // The archived source is disabled and must not be selected.
  assert.ok(!ids.includes('modelcontextprotocol-servers-archived'));
  for (const s of selected) {
    assert.equal(s.enabled, true);
  }
});

test('profile selection filters by tier', () => {
  const manifest = loadManifest();
  const core = selectSources(manifest, { profile: 'core' });
  assert.ok(core.length >= 1);
  for (const s of core) {
    assert.equal(s.tier, 'core');
  }
  const discovery = selectSources(manifest, { profile: 'discovery' });
  for (const s of discovery) {
    assert.equal(s.tier, 'discovery');
  }
});
