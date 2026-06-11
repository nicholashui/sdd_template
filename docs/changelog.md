# Changelog

## 1.1.0-merged-bootstrap — 2026-06-11

- Initial bootstrap of the `sdd_template` starter repository.
- Added source manifests, dependency-free Node bootstrap scripts, shared rules,
  per-agent sync adapters, docs, and a Node test suite.
- `npm run bootstrap` runs doctor → sources:download → sources:audit → security →
  sync (dry-run) → test.
