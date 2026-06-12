# Chapter 18 — Troubleshooting & FAQ

[← Dashboard & Tooling](17-dashboard-and-tooling.md) · [Table of Contents](../README.md) · [Next: Glossary & Reference →](19-glossary-reference.md)

---

A field guide to the problems you'll actually hit, ordered roughly by how common they are. The repo's own `TROUBLESHOOTING.md` and FAQ informed this chapter.

## 18.1 "Everything looks duplicated / ECC feels intrusive or broken"

**Cause:** You stacked install methods — plugin **and** the full installer. The plugin already loads skills/commands/hooks; the installer copied them again.

**Fix (in order):**
```bash
node scripts/ecc.js list-installed      # see what's there
node scripts/ecc.js doctor              # diagnose
node scripts/ecc.js repair              # restore managed files
# if still messy:
node scripts/uninstall.js --dry-run
node scripts/uninstall.js
```
Then: remove the plugin install → uninstall via the repo → delete extra manually-copied rule folders → **reinstall once, one path only.** (Chapter 3, §3.7.)

---

## 18.2 "Duplicate hooks file detected" / hooks aren't working

**Cause:** Claude Code v2.1+ **auto-loads** a plugin's `hooks/hooks.json`. You either declared `"hooks"` in `plugin.json`, or copied `hooks.json` into `settings.json` on top of a plugin install.

**Fix:**
- Don't add a `"hooks"` field to `.claude-plugin/plugin.json` (a regression test enforces this).
- Plugin users: don't copy hooks into `settings.json`.
- Manual users: install hooks via `./install.sh --target claude --modules hooks-runtime`.

(Historic issues: #29, #52, #103.)

---

## 18.3 "My context window is shrinking / Claude runs out of context"

**Cause:** Too many MCP servers/tools enabled — each tool description eats your window. A 200k window can drop to ~70k.

**Fix:**
```text
/mcp     # disable unused servers (persisted to ~/.claude.json)
```
Keep **<10 MCPs / <80 tools**. Also cap SessionStart context (`ECC_SESSION_START_MAX_CHARS=4000` or `ECC_SESSION_START_CONTEXT=off`), compact strategically, and check `/context-budget`. Note: editing `.claude/settings.json` is **not** a reliable way to disable already-loaded MCPs — use `/mcp`.

---

## 18.4 "Hooks are too noisy / too strict / too slow"

Tune at runtime — no file editing:
```bash
export ECC_HOOK_PROFILE=minimal                 # quieter (or 'strict' for max)
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
export ECC_CONTEXT_MONITOR_COST_WARNINGS=off    # keep warnings, drop cost estimates
```
Or install the **`minimal` profile** (no `hooks-runtime`) and add hooks back later with `--modules hooks-runtime`.

---

## 18.5 "I installed the plugin but I have no rules"

**Expected.** Claude Code plugins **cannot distribute rules**. Copy them manually:
```bash
git clone https://github.com/affaan-m/ECC.git && cd ECC
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/
cp -r rules/typescript ~/.claude/rules/ecc/   # your stack
```
Copy whole language directories, not individual files.

---

## 18.6 "`/multi-plan` (or other `multi-*`) doesn't work"

**Cause:** The `multi-*` commands need the external `ccg-workflow` runtime, which the base install doesn't provide.

**Fix:**
```bash
npx ccg-workflow
```
This sets up `~/.claude/bin/codeagent-wrapper`, `~/.claude/.ccg/prompts/*`, etc.

---

## 18.7 "Skills/commands aren't showing up"

- **Check the install:** `/plugin list ecc@ecc` (plugin) or `node scripts/ecc.js list-installed` (manual).
- **Skill placement:** Claude Code loads skills only from **direct children** of `~/.claude/skills/`. Don't nest under `~/.claude/skills/ecc/`.
- **Version:** ensure Claude Code CLI **v2.1.0+** (`claude --version`).
- **Codex plugin path is fragile** upstream — prefer `scripts/sync-ecc-to-codex.sh` over the Codex plugin marketplace.

---

## 18.8 "My local Claude setup got wiped — do I need to repurchase ECC?"

**No.** Run `node scripts/ecc.js list-installed`, then `doctor` and `repair` before reinstalling — that usually restores ECC-managed files. Billing/account recovery for ECC Tools is a separate concern from the OSS files.

---

## 18.9 "Cursor and Claude Code are overwriting each other's memory"

Set a separate agent data home for Cursor:
```bash
export ECC_AGENT_DATA_HOME="$HOME/.cursor/ecc"
```
(Cursor installs try to do this automatically via a `sessionStart` hook + `.cursor/ecc-agent-data.json`.) To deliberately *share* memory, point both at `~/.claude`.

---

## 18.10 Quick FAQ

**Can I use only some components (just agents)?**
Yes — manual install and copy what you want. Each component is independent: `cp agents/*.md ~/.claude/agents/`.

**Does it work with my IDE/CLI?**
Claude Code (native), Cursor, Codex (app+CLI), OpenCode, Gemini, Zed, GitHub Copilot, Antigravity, JoyCode/CodeBuddy, Qwen, and a manual path for others. See Chapter 12.

**Can I run ECC on a custom API endpoint?**
Yes — set `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN`; ECC is provider-agnostic once `claude` works. (Be aware of the `ANTHROPIC_BASE_URL` hijack CVE — only trust your own gateway.)

**How do I check what's installed?**
`/plugin list ecc@ecc` or `node scripts/ecc.js list-installed`.

**How do I contribute a skill/agent?**
Fork → add `skills/your-skill/SKILL.md` or `agents/your-agent.md` with frontmatter → `npm test` → PR. See `CONTRIBUTING.md`.

**Is it really free?**
The repo is MIT-licensed forever. ECC Pro / ECC Tools (hosted GitHub App) and Sponsors fund development but aren't required.

---

## 18.11 The "first thing to run when something's weird" sequence

```bash
node scripts/ecc.js list-installed   # what's installed
node scripts/ecc.js doctor           # what's wrong
node scripts/ecc.js repair           # fix managed files
node tests/run-all.js                # is the repo itself healthy?
npx ecc status --markdown --write status.md   # full readiness snapshot
```

---

## 18.12 Key takeaways

- Most problems trace to **stacked installs** or **double-loaded hooks** — diagnose with `doctor`/`repair`, never reinstall on top.
- Context issues → **trim MCPs** (`/mcp`, <10/<80) and cap SessionStart context.
- Missing rules is **expected** with the plugin — copy them manually.
- `multi-*` commands need **`npx ccg-workflow`**.
- When in doubt: `list-installed → doctor → repair`.

Finally, the reference chapter — every term, command, and env var in one place.

---

[← Dashboard & Tooling](17-dashboard-and-tooling.md) · [Table of Contents](../README.md) · [Next: Glossary & Reference →](19-glossary-reference.md)
