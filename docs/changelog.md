# Changelog



- **New: shared knowledge base.** Vendored ECC's audited corpus under
  `knowledge/` so every supported coding agent works from the same playbook
  (262 skills, 64 agents, 84 commands; ~4.6 MB of plain Markdown/JSON).
- **New scripts:** `scripts/knowledge.mjs` (commands: `import`, `index`,
  `mirror`, `sync`) and `scripts/lib/knowledge.mjs` pure helpers.
- **New npm scripts:** `knowledge:import`, `knowledge:index`,
  `knowledge:mirror`, `knowledge:sync`. `bootstrap` now runs `knowledge:import`
  between `security` and `sync --dry-run`.
- **Sync engine:** every agent's instruction file (13 agents, 18 outputs) now
  embeds a generated "Knowledge Base" section inside its managed-marker block,
  pointing at `knowledge/INDEX.md`, so all agents share the same canonical
  catalog without per-agent format conversion.
- **Safety:** the import allow-lists text-only extensions
  (`.md/.mdc/.markdown/.txt/.rst/.json/.yaml/.yml/.toml/.csv`) and rejects any
  filename matching the security scanner's secret-file patterns. The 54
  non-text/unsafe files in upstream are correctly skipped. `knowledge/` is
  added to the security scanner's first-party scope.
- **Provenance:** `knowledge/NOTICE.md` records source repo, imported commit,
  and the upstream MIT LICENSE verbatim.
- **Tests:** added 8 new tests covering frontmatter parsing, allow-list and
  secret-pattern checks, knowledge-section rendering, and INDEX rendering with
  sorted, knowledge-relative links. Total: 22 → 30, all passing.
- **Docs:** README + `docs/architecture.md` updated with the new feature,
  data-flow, trust boundaries, and a new `knowledge/README.md` is generated
  on import.

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
