# sources/

This directory holds the **source-of-truth manifests** that drive the download,
audit, and sync pipeline.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Canonical list of upstream GitHub repositories to download. Only sources with `"enabled": true` are downloaded. |
| `docs-manifest.json` | List of upstream documentation pages tracked for reference (download is optional). |
| `source-lock.json` | Generated lockfile recording resolved URLs, commits, branches, and license/package files for each downloaded source. |

## Manifest fields

Each entry in `manifest.json` has:

- `id` — stable identifier (also used as the lock key).
- `name` — human-readable name.
- `url` — git clone URL.
- `target` — local path under `external/sources/`.
- `type` — currently always `git`.
- `enabled` — whether the source is downloaded by default.
- `priority` — `required` (failure is fatal), `optional` (failure is non-fatal unless `--strict`), or `archived`.
- `tier` — grouping used by download profiles (`core`, `official`, `discovery`, etc.).
- `quarantine` — whether the source is treated as untrusted reference-only material.
- `import_policy` — `curated-only`, `reference-only`, or `never-import`.
- `purpose` — why the source is tracked.

## Important

Downloaded repositories live under `external/sources/` and are **git-ignored**.
They are untrusted until audited (`docs/source-audit.md`) and are never executed
or imported automatically. See the project `README.md` and `docs/security.md`.
