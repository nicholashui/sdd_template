# Chapter 12 — Cross-Harness Use

[← Everyday Workflows](11-everyday-workflows.md) · [Table of Contents](../README.md) · [Next: Continuous Learning →](13-continuous-learning.md)

---

## 12.1 The big idea: write once, run everywhere

Despite the name "Everything *Claude* Code," ECC is multi-tool. It calls itself *"the first plugin to maximize every major AI coding tool."* You author your agents, skills, and rules once, and the installer translates them into each harness's native layout.

<p align="center">
  <img src="../assets/svg/08-cross-harness.svg" alt="One ECC source catalog adapted to many harnesses" width="800">
</p>

Two architectural decisions make this work:

1. **`AGENTS.md` at the repo root is the universal context file** — read by Claude Code, Cursor, Codex, and OpenCode alike. (GitHub Copilot uses `.github/copilot-instructions.md` instead.)
2. **A DRY adapter pattern** lets other harnesses *reuse* Claude Code's hook scripts instead of duplicating them. Cursor's `adapter.js`, for example, transforms Cursor's event JSON into the shape Claude's `scripts/hooks/*.js` expect.

The install target is just a flag: `--target claude | cursor | codex | opencode | zed | …`.

---

## 12.2 The harness scorecard

Feature coverage varies by tool. A condensed view (counts are v2.0.0 and drift):

| Feature | Claude Code | Cursor | Codex (app+CLI) | OpenCode | GitHub Copilot |
|---------|-------------|--------|------------------|----------|----------------|
| Agents | 64 | shared via AGENTS.md | shared | 12 | n/a |
| Commands | 84 | shared | instruction-based | 35 | 5 prompts |
| Skills | 262 | shared | ~10 native | 37 | via instructions |
| Hook events | 8 | 15 | none yet | 11 | none |
| Rules | 34 | 34 (YAML frontmatter) | instruction-based | 13 | 1 always-on file |
| MCP | 14 | shared | 6–7 (TOML) | full | n/a |
| Context file | CLAUDE.md + AGENTS.md | AGENTS.md | AGENTS.md | AGENTS.md | copilot-instructions.md |

**Read this as:** Claude Code is the reference target (richest surface). Cursor and OpenCode actually have *more* hook events. Codex and Copilot lack a hook system, so enforcement there is *instruction-based* rather than runtime.

---

## 12.3 Claude Code (native)

The primary target — everything in this book applies directly. Install via plugin or manual installer (Chapter 3). Requires CLI **v2.1.0+**.

---

## 12.4 Cursor

Pre-translated configs live in `.cursor/`. Install:
```bash
./install.sh --target cursor typescript
./install.sh --target cursor python golang swift php
```
What you get: 15 hook events, 16 thin hook scripts (delegating to the shared `scripts/hooks/` via `adapter.js`), 34 rules (YAML frontmatter with `description`/`globs`/`alwaysApply`), agents installed as `.cursor/agents/ecc-*.md` (prefixed to avoid collisions), plus shared skills/commands/MCP.

**Memory isolation matters here.** Because Cursor reuses the same hook scripts, ECC keeps Cursor's memory out of `~/.claude` automatically (via a `sessionStart` hook that sets `ECC_AGENT_DATA_HOME`, a default of `~/.cursor/ecc`, a `.cursor/ecc-agent-data.json` override, and an always-on rule). To deliberately *share* memory with Claude Code, point `ECC_AGENT_DATA_HOME` at `~/.claude`.

Cursor's hook system is actually richer than Claude's (20 vs 8 events): `beforeShellExecution`, `afterFileEdit`, `beforeSubmitPrompt` (secret detection), `beforeTabFileRead` (blocks Tab from reading `.env`/`.key`/`.pem`), `beforeMCPExecution`/`afterMCPExecution` (audit logging), and more.

---

## 12.5 Codex (macOS app + CLI)

First-class support via `AGENTS.md` + `.codex/config.toml`. The cleanest setup is the sync script:
```bash
npm install && bash scripts/sync-ecc-to-codex.sh
# add-only merge into ~/.codex; --dry-run to preview, --update-mcp to refresh servers
```
Or just run `codex` in the repo — root `AGENTS.md` and `.codex/` are auto-detected. The reference `.codex/config.toml` intentionally doesn't pin `model`/`model_provider` (Codex uses its own default).

What's included: top-level approvals/sandbox/web_search config, 6 MCP servers (7 with Supabase via `--update-mcp`), 32 skills under `.agents/skills/`, two profiles (`strict` read-only, `yolo` full auto-approve), and three sample agent roles (`explorer`, `reviewer`, `docs_researcher`).

**Key limitation:** Codex has **no hook execution parity** yet, so ECC enforcement is instruction-based via `AGENTS.md`, optional `model_instructions_file` overrides, and sandbox/approval settings. The experimental Codex plugin-marketplace path is fragile upstream; prefer the sync script.

---

## 12.6 OpenCode

Full plugin support via `.opencode/`. Just run it in the repo:
```bash
npm install -g opencode
opencode      # auto-detects .opencode/opencode.json
```
Or install the published plugin:
```bash
npm install ecc-universal
# then in opencode.json:  { "plugin": ["ecc-universal"] }
```
Note: the npm plugin enables ECC's OpenCode hooks/events and plugin tools — it does **not** auto-add the full command/agent/instruction catalog. For the complete setup, run OpenCode inside the repo or copy `.opencode/` assets into your project and wire `instructions`/`agent`/`command` in `opencode.json`.

OpenCode's plugin system is sophisticated (20+ event types). ECC maps Claude's hooks onto OpenCode events (`tool.execute.before/after`, `session.idle`, `session.created/deleted`) and adds extras like `file.edited` and `lsp.client.diagnostics`. It also exposes **6 native custom tools** (run-tests, check-coverage, security-audit, …).

---

## 12.7 GitHub Copilot (VS Code)

No extra tooling — Copilot Chat reads instruction and prompt files automatically:
- `.github/copilot-instructions.md` — always-injected core rules (coding style, security, testing, git).
- `.github/prompts/*.prompt.md` — reusable on-demand prompts: `plan`, `tdd`, `security-review`, `build-fix`, `refactor`.
- `.vscode/settings.json` — per-task instruction overlays (code gen, test gen, commit messages) and `chat.promptFiles` enablement.

**Limitation:** Copilot has **no hook system and no subagent API**, so ECC's automations and agent delegation don't apply. You still get the full coding *philosophy* in every chat.

---

## 12.8 The rest

- **Gemini CLI** — experimental project-local support via `.gemini/GEMINI.md`.
- **Zed** — conservative `.zed/` adapter: `./install.sh --profile minimal --target zed`. Keep API keys in Zed's own settings, not the repo.
- **Antigravity** — tightly integrated setup (`.agent/`); see `docs/ANTIGRAVITY-GUIDE.md`.
- **JoyCode / CodeBuddy** — project-local selective install adapters; see `docs/JOYCODE-GUIDE.md`.
- **Qwen CLI** — home-directory selective adapter; see `docs/QWEN-GUIDE.md`.
- **Non-native (Grok, etc.)** — a manual fallback path; see `docs/MANUAL-ADAPTATION-GUIDE.md`.

---

## 12.9 Running on a custom endpoint / gateway

ECC doesn't hardcode Anthropic transport, so it works through Claude Code's normal gateway support:
```bash
export ANTHROPIC_BASE_URL=https://your-gateway.example.com
export ANTHROPIC_AUTH_TOKEN=your-token
claude
```
If your gateway remaps model names, configure that in Claude Code, not ECC. ECC's skills/hooks/commands/rules are provider-agnostic once `claude` works. (Note: a malicious project overriding `ANTHROPIC_BASE_URL` was a real CVE — see Chapter 15.)

---

## 12.10 Key takeaways

- ECC is **multi-harness**: author once, the installer adapts it (just change `--target`).
- **`AGENTS.md`** is the universal context file; a **DRY adapter** reuses hook scripts across tools.
- **Claude Code** is the reference; **Cursor/OpenCode** have more hook events; **Codex/Copilot** lack hooks (instruction-based enforcement).
- **Isolate memory** between harnesses with `ECC_AGENT_DATA_HOME`.
- Codex setup = `sync-ecc-to-codex.sh`; OpenCode = run-in-repo or `ecc-universal` plugin; Copilot = instruction/prompt files.

Next: how ECC gets smarter the more you use it.

---

[← Everyday Workflows](11-everyday-workflows.md) · [Table of Contents](../README.md) · [Next: Continuous Learning →](13-continuous-learning.md)
