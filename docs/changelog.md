# Changelog

## 1.1.0-merged-bootstrap — 2026-06-11 (audit + refresh)

- Audited the project against `project_starter.md` and the upstream
  `affaan-m/ecc` reference. Structure, `sources/manifest.json`,
  `sources/docs-manifest.json`, and the supported-agent surface verified
  consistent (sdd_template is a conservative superset of ecc's agent surface).
- Re-ran `npm run bootstrap`: all 26 enabled sources downloaded (0 failures),
  audit/security/sync-dry-run/tests (22/22) pass.
- Refreshed `sources/source-lock.json` and `docs/source-audit.md` to current
  upstream commits (`ecc` now at `fec84fc`).
- Confirmed no drift: `npm run sync` regenerates the 18 agent-config files
  byte-for-byte identically to the committed versions.

## 1.1.0-merged-bootstrap — 2026-06-11

- Initial bootstrap of the `sdd_template` starter repository.
- Added source manifests, dependency-free Node bootstrap scripts, shared rules,
  per-agent sync adapters, docs, and a Node test suite.
- `npm run bootstrap` runs doctor → sources:download → sources:audit → security →
  sync (dry-run) → test.
