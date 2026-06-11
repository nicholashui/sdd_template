# sdd_template

Executable starter for downloading, auditing, curating, and syncing AI coding-agent harness sources.

Supported agents: **Claude Code, Codex, Gemini CLI, Cursor, OpenCode, Grok Build, GitHub Copilot, Kiro, CodeBuddy, Trae, VS Code (Copilot), Zed, Qwen Code**.

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
5. `knowledge:import` — vendor the shared knowledge corpus into `knowledge/`.
6. `sync -- --dry-run` — preview generated agent-config files.
7. `test` — run the Node test suite.

## Shared knowledge base

After `npm run bootstrap`, `knowledge/` contains a curated, audited corpus
shared across **every** supported coding agent so they all work from the same
playbook:

- `knowledge/skills/<name>/SKILL.md` — 262 reusable skills
- `knowledge/agents/<name>.md` — 64 specialist personas
- `knowledge/commands/<name>.md` — 84 workflow playbooks
- `knowledge/INDEX.md` — full catalog
- `knowledge/NOTICE.md` — provenance + license (sourced from
  [`affaan-m/ECC`](https://github.com/affaan-m/ECC), MIT)

Each agent's instruction file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/...`,
etc.) is auto-generated to point at this corpus, so all 13 supported agents
read from the same canonical source. Files are plain Markdown / JSON — no
format conversion is needed for an agent to use them.

Refresh the corpus from upstream:

```bash
npm run knowledge:import        # import skills/agents/commands from external/sources/ecc
npm run sync                    # re-project the catalog into every agent config
```

Optional native auto-discovery for Claude Code:

```bash
npm run knowledge:mirror        # mirror knowledge/ into .claude/{skills,agents,commands}/
```

## Common commands

| Command | Purpose |
|---|---|
| `npm run doctor` | Environment checks. |
| `npm run sources:download` | Clone enabled sources. |
| `npm run sources:update` | Fetch + fast-forward existing sources. |
| `npm run sources:check` | Report source status without downloading. |
| `npm run sources:audit` | Regenerate `docs/source-audit.md`. |
| `npm run security` | Static security scan. |
| `npm run knowledge:import` | Vendor skills/agents/commands from a downloaded source into `knowledge/`. |
| `npm run knowledge:index` | Regenerate `knowledge/INDEX.md` from the manifest. |
| `npm run knowledge:mirror` | Mirror `knowledge/` into a single agent's native skills dir (default: `.claude`). |
| `npm run knowledge:sync` | `index` (+ `mirror` when `-- --mirror` is passed). |
| `npm run sync` | Generate agent-config files from `rules/` + `knowledge/`. |
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
skills/      curated first-party skill categories (project-specific)
knowledge/   shared, vendored knowledge corpus (skills/agents/commands)
             — committed; readable by every agent as plain Markdown
docs/        documentation + generated source audit
tests/       Node test suite
```
