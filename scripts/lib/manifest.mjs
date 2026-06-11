// manifest.mjs
// Load, validate, and select sources from sources/manifest.json.

import { readJson, exists } from './fs-safe.mjs';

export const MANIFEST_PATH = 'sources/manifest.json';
export const DOCS_MANIFEST_PATH = 'sources/docs-manifest.json';
export const LOCK_PATH = 'sources/source-lock.json';

const REQUIRED_FIELDS = ['id', 'url', 'target', 'priority', 'tier', 'import_policy'];

/** Load the source manifest from disk. */
export function loadManifest(p = MANIFEST_PATH) {
  if (!exists(p)) {
    throw new Error(`Manifest not found: ${p}`);
  }
  return readJson(p);
}

/**
 * Validate the manifest structure.
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateManifest(manifest) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object') {
    return { ok: false, errors: ['manifest is not an object'] };
  }
  if (!Array.isArray(manifest.sources)) {
    return { ok: false, errors: ['manifest.sources is missing or not an array'] };
  }

  const seenIds = new Set();
  const downloadRoot = manifest.download_root || 'external/sources';

  for (const [i, src] of manifest.sources.entries()) {
    const label = src && src.id ? src.id : `index ${i}`;
    for (const field of REQUIRED_FIELDS) {
      if (src[field] === undefined || src[field] === null || src[field] === '') {
        errors.push(`source "${label}" is missing required field "${field}"`);
      }
    }
    if (src.id) {
      if (seenIds.has(src.id)) {
        errors.push(`duplicate source id "${src.id}"`);
      }
      seenIds.add(src.id);
    }
    if (src.target && !src.target.startsWith(`${downloadRoot}/`)) {
      errors.push(
        `source "${label}" target "${src.target}" must start with "${downloadRoot}/"`,
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Select sources for a download run.
 * @param {object} manifest
 * @param {object} opts
 * @param {string} [opts.profile='all'] one of all|core|official|discovery|<tier>
 * @param {boolean} [opts.includeDisabled=false]
 * @returns {object[]}
 */
export function selectSources(manifest, { profile = 'all', includeDisabled = false } = {}) {
  let sources = manifest.sources.slice();

  if (!includeDisabled) {
    sources = sources.filter((s) => s.enabled === true);
  }

  if (profile && profile !== 'all') {
    sources = sources.filter((s) => s.tier === profile || s.priority === profile);
  }

  return sources;
}

/** Group selected sources by required/optional. */
export function partitionByPriority(sources) {
  return {
    required: sources.filter((s) => s.priority === 'required'),
    optional: sources.filter((s) => s.priority !== 'required'),
  };
}

export default {
  MANIFEST_PATH,
  DOCS_MANIFEST_PATH,
  LOCK_PATH,
  loadManifest,
  validateManifest,
  selectSources,
  partitionByPriority,
};
