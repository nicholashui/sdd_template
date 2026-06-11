# Status

## Current phase

Bootstrap complete.

## Latest update

`npm run bootstrap` ran successfully on 2026-06-11 (Node v22.22.3, git 2.50.1).
Shared knowledge base imported from `external/sources/ecc` @ `fec84fc` (MIT):
**262 skills · 64 agents · 84 commands** vendored under `knowledge/`, with
54 non-text/unsafe files correctly skipped.

### Pipeline results

| Step | Result |
|---|---|
| doctor | pass |
| sources:download | pass |
| sources:audit | pass |
| security | pass (1 advisory: ecc `postinstall`, never executed) |
| knowledge:import | pass (262 skills, 64 agents, 84 commands) |
| sync --dry-run | pass |
| test | pass (30/30) |

### Sources

- Enabled sources in manifest: 26 (plus 1 disabled archived source = 27 total).
- Downloaded: 26
- Failed: 0
- Skipped (disabled): 1 (`modelcontextprotocol-servers-archived`)

Downloaded repositories are in `external/sources/` and are git-ignored (not
committed). Commit metadata is recorded in `sources/source-lock.json`.

### Generated artifacts

- `sources/source-lock.json`
- `docs/source-audit.md`
- `knowledge/manifest.json`, `knowledge/INDEX.md`, `knowledge/README.md`,
  `knowledge/NOTICE.md` plus the vendored `knowledge/skills/`,
  `knowledge/agents/`, `knowledge/commands/`, `knowledge/references/` trees.
- Agent configs via `npm run sync` (13 agents, 18 files): `AGENTS.md`,
  `CLAUDE.md`, `GEMINI.md`, `QWEN.md`, `.cursor/`, `.claude/`, `.codex/`,
  `.gemini/`, `.opencode/`, `.grok/`, `.github/copilot-instructions.md`,
  `.kiro/steering/` + `.kiro/settings/mcp.json`, `.codebuddy/rules/`,
  `.trae/rules/project_rules.md`, `.vscode/settings.json`, `.zed/settings.json`,
  `docs/agents.md`. Every agent file embeds the same generated "Knowledge Base"
  catalog pointing at `knowledge/INDEX.md`.

### Supported agents

Claude Code, OpenAI Codex, Gemini CLI, Cursor, OpenCode, Grok Build, GitHub
Copilot, Kiro, CodeBuddy, Trae, VS Code (Copilot), Zed, and Qwen Code. The agent
surface mirrors the configurations shipped by the upstream `ecc`
(Everything Claude Code) source.

### Audit notes

7 sources have no detected license file and are flagged as not safe for automatic
import (`anthropic-skills`, `andrej-karpathy-skills`,
`andrej-karpathy-skills-cursor-vscode`, `vercel-agent-skills`,
`itgoyo-awesome-agent-skills`, `itgoyo-awesome-claude-code-skills`,
`subinium-awesome-claude-code`). All quarantined/reference-only sources also
remain unsafe for automatic import pending human review. See `docs/source-audit.md`.

## Blockers

None. Network was available; all enabled sources downloaded successfully.

## Commands to run

```bash
npm run bootstrap
```
