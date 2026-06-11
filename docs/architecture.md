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
        ├──► scripts/knowledge.mjs (import) ──► knowledge/skills, /agents,
        │                                       /commands, /references,
        │                                       INDEX.md, NOTICE.md, manifest.json
        │
rules/*.md + knowledge/manifest.json
        │
        ▼
scripts/sync.mjs ──► AGENTS.md, CLAUDE.md, GEMINI.md, QWEN.md,
                     .cursor/, .claude/, .codex/, .gemini/, .opencode/,
                     .grok/, .github/copilot-instructions.md, .kiro/,
                     .codebuddy/, .trae/, .vscode/, .zed/
                     (every output embeds the same Knowledge Base catalog)
```

## Trust boundaries

| Stage | Location | Trust |
|---|---|---|
| Downloaded source | `external/sources/<id>/` | untrusted, never executed |
| Audited source | `docs/source-audit.md`, `sources/source-lock.json` | reviewed metadata |
| Curated import | `rules/`, `skills/`, `hooks/`, `mcp-configs/` | first-party, attributed |
| Vendored knowledge | `knowledge/` | text-only (Markdown/JSON/YAML/TOML/CSV/TXT), license-attributed in `knowledge/NOTICE.md`, never executed |
| Generated output | `AGENTS.md`, `CLAUDE.md`, dotfiles | reproducible via `npm run sync` |

## Modules

- `scripts/lib/fs-safe.mjs` — writes constrained to the project root.
- `scripts/lib/git.mjs` — shell-free git wrapper (clone/update/metadata only).
- `scripts/lib/manifest.mjs` — manifest load/validate/select.
- `scripts/lib/markers.mjs` — generated-file header and managed-block helpers.
- `scripts/lib/knowledge.mjs` — pure helpers for the shared knowledge base
  (frontmatter parsing, allow-list checks, catalog/index rendering).
- `scripts/lib/report.mjs` — console formatting.
- `scripts/adapters/*.mjs` — per-agent config generators.
- `scripts/knowledge.mjs` — import / index / mirror / sync the knowledge corpus.

## Shared knowledge base

`knowledge/` is the canonical, committed corpus shared across every supported
agent. Vendored from MIT-licensed upstream sources (default: ECC) and stored as
plain Markdown/JSON so it is **readable by every coding agent without format
conversion**. The `sync` engine injects a "Knowledge Base" section into every
agent's instruction file (inside the managed marker block), so all 13 agents
point at the same `knowledge/INDEX.md` and discover the same skills, agents,
and commands.

Safety: only text content with allowed extensions is imported (`.md`, `.mdc`,
`.markdown`, `.txt`, `.rst`, `.json`, `.yaml`, `.yml`, `.toml`, `.csv`).
Executable files, binaries, and credential-shaped names are skipped. `knowledge/`
is included in the security scanner's first-party scope to enforce this.

## Design constraints

- No runtime third-party dependencies for bootstrap scripts.
- Git is invoked with `execFileSync` (no shell), so source URLs cannot be
  interpreted by a shell.
- Downloaded code is never executed, installed, or auto-imported.
