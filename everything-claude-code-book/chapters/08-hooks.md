# Chapter 8 — Hooks

[← Commands](07-commands.md) · [Table of Contents](../README.md) · [Next: Rules & Memory →](09-rules-and-memory.md)

---

## 8.1 What hooks are

A **hook** is an automation that fires on a specific event — a tool call, a session starting, the context about to be compacted. Unlike skills and commands, you never invoke a hook; the harness triggers it. Hooks are ECC's **reflexes**: the formatting, gating, secret-scanning, and memory-saving that should happen *every time*, automatically, without you remembering to do it.

In ECC, `hooks/hooks.json` declares the events and matchers, and each entry runs a **Node.js script** under `scripts/hooks/`. (Node, not inline bash, for cross-platform reliability — a deliberate hardening from v1.8.)

---

## 8.2 The event lifecycle

<p align="center">
  <img src="../assets/svg/06-hook-lifecycle.svg" alt="Hook events across a session lifecycle" width="800">
</p>

The main events (Claude Code names; other harnesses map onto these):

| Event | Fires | ECC uses it to… |
|-------|-------|------------------|
| **SessionStart** | New session begins | Load previous context, detect package manager, inject a memory summary |
| **PreToolUse** | Before a tool runs | Remind about `tmux`, gate `git push`, scan for secrets, protect config files, fact-force before first edit |
| **PostToolUse** | After a tool finishes | Format (prettier), type-check (tsc), quality gate, warn on `console.log`, update metrics & context monitor |
| **PostToolUseFailure** | A tool errored | Capture failure context for diagnostics |
| **PreCompact** | Before context compaction | Save important state to a file first |
| **Stop** | Session ends | Write a session summary, batch format/typecheck, extract learnings |

A few representative ECC hooks (by id) you'll see in `hooks.json`:

- `pre:bash:dispatcher` — a consolidated Bash preflight (quality, tmux, push, gate checks).
- `pre:edit-write:gateguard-fact-force` — blocks the *first* edit per file and demands investigation (who imports this? what's the schema? what did the user actually ask?) before allowing changes.
- `pre:config-protection` — blocks edits to linter/formatter configs, steering the agent to fix the code instead of weakening the config.
- `post:quality-gate` — runs quality checks after edits.
- `post:edit:console-warn` — warns about `console.log`.
- `post:ecc-context-monitor` — injects warnings on context exhaustion, high cost, scope creep, or tool loops.
- `session:start` — the SessionStart bootstrap (memory + package manager).
- `pre:compact` / Stop summary — memory persistence (Chapter 9).

> The actual `command` strings in `hooks.json` look gnarly because each one bootstraps the correct plugin root across many possible install locations before delegating to the real script. You never write that by hand — the installer generates it.

---

## 8.3 Tuning hooks without editing files

This is one of ECC's nicest features. You control hook behavior with **environment variables** — no JSON editing:

```bash
# Strictness profile: minimal | standard | strict   (default: standard)
export ECC_HOOK_PROFILE=standard

# Disable specific hooks by id (comma-separated)
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"

# Cap or disable the SessionStart context injection
export ECC_SESSION_START_MAX_CHARS=4000
export ECC_SESSION_START_CONTEXT=off        # for low-context / local models

# Session retention window in days (0/off/never = keep all)
export ECC_SESSION_RETENTION_DAYS=14

# Keep context/scope/loop warnings but hide API-rate cost estimates
export ECC_CONTEXT_MONITOR_COST_WARNINGS=off

# Opt-in governance event capture
export ECC_GOVERNANCE_CAPTURE=1
```

Windows PowerShell:
```powershell
[Environment]::SetEnvironmentVariable('ECC_SESSION_RETENTION_DAYS', '14', 'User')
```

Each hook is tagged with the profiles it runs under (e.g. `standard,strict`). So `ECC_HOOK_PROFILE=minimal` quietly drops the noisier ones, while `strict` turns everything on.

---

## 8.4 The "Duplicate hooks file" trap

The single most-reported hook issue. Claude Code **v2.1+ auto-loads** a plugin's `hooks/hooks.json` by convention. If you *also* declare hooks in `.claude-plugin/plugin.json`, or copy `hooks.json` into `settings.json` after a plugin install, you get:

```text
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

Avoid it:
- **Contributors:** never add a `"hooks"` field to `plugin.json` (a regression test enforces this).
- **Plugin users:** don't copy hooks into `settings.json` — they're already loaded.
- **Manual users:** install hooks via `./install.sh --target claude --modules hooks-runtime`, which writes to `~/.claude/hooks/hooks.json` and leaves `settings.json` alone.

---

## 8.5 The conceptual shape of a hook

If you peel away the bootstrap wrapper, a hook entry is just:

```json
{
  "matcher": "Edit|Write|MultiEdit",
  "hooks": [
    { "type": "command", "command": "node scripts/hooks/quality-gate.js", "async": true, "timeout": 30 }
  ],
  "description": "Run quality gate checks after file edits",
  "id": "post:quality-gate"
}
```

- **`matcher`** — which tool(s) or events this applies to (`Bash`, `Edit|Write|MultiEdit`, or `*`).
- **`hooks[].command`** — the script to run.
- **`async` / `timeout`** — don't block the agent; cap runtime.
- **`id`** — the handle you use in `ECC_DISABLED_HOOKS`.

Exit-code convention (from `RULES.md`): exit `1` (or `2` for hard blocks) **only** when blocking is intentional; otherwise exit `0`. Messages should be **actionable**.

A minimal hand-written example from the guides (warn about `console.log`):
```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

---

## 8.6 Creating hooks the easy way

Writing hook JSON by hand is fiddly. The shortform guide recommends the **`hookify`** approach: run `/hookify` and *describe* what you want conversationally, and it generates the hook for you. ECC also ships `/hookify-list`, `/hookify-configure`, and `/hookify-help`.

If you author one manually, validate with `node scripts/ci/validate-hooks.js` (part of `npm test`).

---

## 8.7 What hooks give you in practice

With hooks on `standard`, a normal editing session quietly gets:

- **Auto-format + type-check** after edits (no more "forgot to run prettier").
- **Secret detection** before risky tool calls and prompt submission.
- **A `git push` review gate** so pushes aren't silent.
- **A `tmux` reminder** for long-running commands.
- **Memory persistence** across sessions.
- **Continuous-learning capture** feeding instincts.
- **A context monitor** that warns you before you hit a wall.

That's a lot of senior-engineer discipline for zero ongoing effort.

---

## 8.8 Key takeaways

- Hooks are **automatic** reflexes on tool/session events; `hooks.json` → Node scripts.
- Lifecycle: **SessionStart → PreToolUse → PostToolUse → PreCompact → Stop.**
- Tune at runtime with **`ECC_HOOK_PROFILE`** and **`ECC_DISABLED_HOOKS`** — no file editing.
- Never double-load hooks (the "Duplicate hooks file" trap) — install them the right way.
- Use **`/hookify`** to create hooks by description rather than writing JSON.

Next: the always-on guidelines and the memory that survives sessions.

---

[← Commands](07-commands.md) · [Table of Contents](../README.md) · [Next: Rules & Memory →](09-rules-and-memory.md)
