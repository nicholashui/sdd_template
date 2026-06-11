# Architecture

## Overview

`sdd_template` is a dependency-free Node.js toolchain that turns a declarative set
of manifests and rules into:

1. downloaded upstream sources (untrusted, git-ignored),
2. an audit + lockfile describing those sources, and
3. generated agent-configuration files for multiple coding agents.

## Data flow

```text
sources/manifest.json
        │
        ▼
scripts/source-download.mjs ──► external/sources/<id>/   (clone/update only)
        │
        ▼
sources/source-lock.json  ──► scripts/source-audit.mjs ──► docs/source-audit.md
        │
rules/*.md ──► scripts/sync.mjs ──► AGENTS.md, CLAUDE.md, GEMINI.md,
                                    .cursor/, .claude/, .codex/, .gemini/,
                                    .opencode/, .grok/, .github/copilot-instructions.md
```

## Trust boundaries

| Stage | Location | Trust |
|---|---|---|
| Downloaded source | `external/sources/<id>/` | untrusted, never executed |
| Audited source | `docs/source-audit.md`, `sources/source-lock.json` | reviewed metadata |
| Curated import | `rules/`, `skills/`, `hooks/`, `mcp-configs/` | first-party, attributed |
| Generated output | `AGENTS.md`, `CLAUDE.md`, dotfiles | reproducible via `npm run sync` |

## Modules

- `scripts/lib/fs-safe.mjs` — writes constrained to the project root.
- `scripts/lib/git.mjs` — shell-free git wrapper (clone/update/metadata only).
- `scripts/lib/manifest.mjs` — manifest load/validate/select.
- `scripts/lib/markers.mjs` — generated-file header and managed-block helpers.
- `scripts/lib/report.mjs` — console formatting.
- `scripts/adapters/*.mjs` — per-agent config generators.

## Design constraints

- No runtime third-party dependencies for bootstrap scripts.
- Git is invoked with `execFileSync` (no shell), so source URLs cannot be
  interpreted by a shell.
- Downloaded code is never executed, installed, or auto-imported.
