# sdd_template

Executable starter for downloading, auditing, curating, and syncing AI coding-agent harness sources.

Supported agents: **Claude Code, Codex, Gemini CLI, Cursor, OpenCode, Grok Build, GitHub Copilot**.

## Quick start

```bash
npm run bootstrap
```

This downloads approved upstream repositories into:

```text
external/sources/
```

Then it writes:

```text
sources/source-lock.json
docs/source-audit.md
```

## What bootstrap does

`npm run bootstrap` runs, in order:

1. `doctor` — environment preflight (Node, git, manifest, writability).
2. `sources:download` — clone/update every enabled source from `sources/manifest.json`.
3. `sources:audit` — generate `docs/source-audit.md`.
4. `security` — static safety smoke checks.
5. `sync -- --dry-run` — preview generated agent-config files.
6. `test` — run the Node test suite.

## Common commands

| Command | Purpose |
|---|---|
| `npm run doctor` | Environment checks. |
| `npm run sources:download` | Clone enabled sources. |
| `npm run sources:update` | Fetch + fast-forward existing sources. |
| `npm run sources:check` | Report source status without downloading. |
| `npm run sources:audit` | Regenerate `docs/source-audit.md`. |
| `npm run security` | Static security scan. |
| `npm run sync` | Generate agent-config files from `rules/`. |
| `npm run sync -- --dry-run` | Preview generated files. |
| `npm run review` | List pending suggestions awaiting approval. |
| `npm run test` | Run tests. |
| `npm run create -- --name demo --path ../demo` | Scaffold a new project. |

## Important

Downloaded repositories are **untrusted until audited**.

The project does not execute downloaded code and does not import third-party skills
automatically. Only curated, attributed files may be copied into first-party
directories (`rules/`, `skills/`, `hooks/`, `mcp-configs/`). See `docs/security.md`.

## Layout

```text
sources/     source-of-truth manifests + generated lockfile
external/    downloaded upstream repos (git-ignored, untrusted)
scripts/     executable bootstrap/sync/audit/security tooling
rules/       shared agent rules (composed by sync)
skills/      curated skill categories
docs/        documentation + generated source audit
tests/       Node test suite
```
