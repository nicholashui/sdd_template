# Chapter 19 — Glossary & Quick Reference

[← Troubleshooting & FAQ](18-troubleshooting-faq.md) · [Table of Contents](../README.md)

---

The one-page-ish cheat sheet. Bookmark this chapter.

## 19.1 Glossary

| Term | Meaning |
|------|---------|
| **ECC** | Everything Claude Code — the agent-harness operating system (this project). *Not* elliptic curve cryptography. |
| **Harness** | The program wrapping a model that lets it act (Claude Code, Cursor, Codex, OpenCode, …). |
| **Agent (sub-agent)** | A scoped specialist the orchestrator delegates to; own context, limited tools, chosen model. |
| **Orchestrator** | The main assistant that delegates to agents and assembles results. |
| **Skill** | The canonical reusable workflow unit (`skills/<name>/SKILL.md`). |
| **Command** | A typed slash entry (`/plan`); a compatibility layer over skills. |
| **Hook** | An automation triggered by a tool/session event (`hooks/hooks.json` → Node scripts). |
| **Rule** | An always-follow guideline loaded every session (`rules/common/` + per-language). |
| **MCP** | Model Context Protocol — a server exposing tools the model can call (GitHub, DB, browser). |
| **Instinct** | A small, confidence-scored unit of learned behavior (continuous-learning-v2). |
| **Codemap** | A lightweight map of a codebase so the assistant navigates without re-exploring. |
| **Profile** | An install bundle: `minimal`, `core`, `full`. |
| **Target** | The harness an install is for: `--target claude|cursor|codex|opencode|zed|…`. |
| **Agent data home** | Root for ECC's session/memory/metrics data (default `~/.claude`; `ECC_AGENT_DATA_HOME`). |
| **Lethal trifecta** | private data + untrusted content + external comms in one runtime = exfiltration risk. |
| **AgentShield** | ECC's bundled security auditor (`npx ecc-agentshield`). |
| **Prompt Defense Baseline** | The anti-injection rule block present in every agent and in `CLAUDE.md`. |
| **ECC 2.0 / `ecc2/`** | The Rust control-plane prototype for managing many sessions (alpha). |
| **pass@k / pass^k** | "at least one of k succeeds" vs "all k succeed" — eval reliability metrics. |

---

## 19.2 The three names of ECC

| Context | Identifier |
|---------|-----------|
| GitHub repo | `affaan-m/ECC` (alias `affaan-m/ecc`) |
| Plugin / marketplace | `ecc@ecc` |
| npm package | `ecc-universal` |

---

## 19.3 Install quick reference

```bash
# Plugin (in Claude Code)
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc

# Manual / CLI
git clone https://github.com/affaan-m/ECC.git && cd ECC && npm install
./install.sh --profile minimal --target claude          # minimal = no hooks
./install.sh --profile core --without baseline:hooks --target claude
./install.sh --target claude --modules hooks-runtime    # add hooks later
npx ecc-install --profile minimal --target claude        # no clone needed

# Find what to install
npx ecc consult "security reviews" --target claude

# Rules (always manual)
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/
cp -r rules/typescript ~/.claude/rules/ecc/

# Lifecycle / reset
node scripts/ecc.js list-installed | doctor | repair
node scripts/uninstall.js --dry-run
node scripts/uninstall.js

# Other harnesses
./install.sh --target cursor typescript
bash scripts/sync-ecc-to-codex.sh
./install.sh --profile minimal --target zed
opencode      # in repo, auto-detects .opencode/
```

> **Golden rule:** pick ONE path. Never plugin + full installer together.

---

## 19.4 Command quick reference (by job)

```text
PLAN/BUILD   /plan  /plan-prd  /multi-plan  /multi-execute  /orch-build-mvp  /orch-add-feature
TEST         tdd-workflow(skill)  /test-coverage  /go-test  /rust-test  /cpp-test  /react-test
REVIEW       /code-review  /python-review  /go-review  /rust-review  /security-scan
BUILD-FIX    /build-fix  /go-build  /rust-build  /kotlin-build  /gradle-build
VERIFY       /quality-gate  eval-harness(skill)  verification-loop(skill)
SESSIONS     /save-session  /resume-session  /sessions  /checkpoint  /aside  /context-budget
LEARN        /learn  /learn-eval  /evolve  /promote  /instinct-status  /instinct-import
             /instinct-export  /skill-create  /skill-health  /rules-distill  /prune
DOCS         /docs  /update-docs  /update-codemaps
LOOPS        /loop-start  /loop-status  /claw
HARNESS      /harness-audit  /model-route  /pm2  /setup-pm  /cost-report  /hookify
PR           /pr  /review-pr  /prp-prd  /prp-plan  /prp-implement  /prp-commit  /prp-pr
```
Plugin form prefixes with the namespace, e.g. `/ecc:plan`.

---

## 19.5 Environment variable reference

| Variable | Effect |
|----------|--------|
| `ECC_HOOK_PROFILE` | Hook strictness: `minimal` / `standard` (default) / `strict` |
| `ECC_DISABLED_HOOKS` | Comma-separated hook ids to disable |
| `ECC_SESSION_START_MAX_CHARS` | Cap SessionStart injected context (default 8000) |
| `ECC_SESSION_START_CONTEXT` | `off` disables SessionStart context entirely |
| `ECC_SESSION_RETENTION_DAYS` | Session pruning window (0/off/never = keep all) |
| `ECC_CONTEXT_MONITOR_COST_WARNINGS` | `off` hides API-rate cost estimates |
| `ECC_AGENT_DATA_HOME` | Root for session/memory/metrics data (isolate per harness) |
| `ECC_DISABLED_MCPS` | Install/sync filter to skip bundled MCP servers |
| `ECC_GOVERNANCE_CAPTURE` | `1` enables governance event capture |
| `CLV2_HOMUNCULUS_DIR` | Continuous-learning-v2 instinct storage (default `~/.local/share/ecc-homunculus`) |
| `CLAUDE_PACKAGE_MANAGER` | Force package manager (npm/pnpm/yarn/bun) |
| `ANTHROPIC_BASE_URL` / `ANTHROPIC_AUTH_TOKEN` | Custom gateway/endpoint (trust only your own) |

---

## 19.6 Token-optimization defaults

```json
// ~/.claude/settings.json
{ "model": "sonnet",
  "env": { "MAX_THINKING_TOKENS": "10000", "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50" } }
```
Routing: **Haiku** (search/simple) · **Sonnet** (default coding) · **Opus** (architecture/security/hard debugging). Keep **<10 MCPs / <80 tools**. Use `mgrep`. Keep files modular.

---

## 19.7 Security minimum bar

1. Separate identity (`agent@…`, scoped tokens).
2. Isolate untrusted work (container/VM, `internal: true`).
3. Deny rules for `~/.ssh`, `~/.aws`, `.env`, `curl|bash`, `ssh`, `scp`, `nc`.
4. Scope tools per workflow; least privilege.
5. Sanitize input; keep the Prompt Defense Baseline.
6. Approvals + logging + kill switch.
7. `npx ecc-agentshield scan` (fix criticals).
8. Don't clone-and-open untrusted repos on your host.

---

## 19.8 The mental model in one diagram

```text
        Identity & Governance   (SOUL / RULES / AGENTS — the constitution)
                  │ governs
        Component Catalog       (agents · skills · commands · rules · mcp)
                  │ shaped by
        Adapters & Installer    (install.sh · manifests · state store · --target)
                  │ lands & enforced by
        Runtime                 (hooks → scripts; memory; learning; metrics; ecc2)
```

Five principles cut across all layers: **Agent-First · Test-Driven · Security-First · Immutability · Plan-Before-Execute.**

---

## 19.9 Where to go next

- The repo's own guides: `the-shortform-guide.md` (read first), `the-longform-guide.md`, `the-security-guide.md`.
- `COMMANDS-QUICK-REF.md` for the live command list.
- `docs/` for deep dives (architecture, releases, per-harness guides, i18n).
- Source: <https://github.com/affaan-m/ecc>

---

*You've reached the end. You now know what ECC is, why it exists, how it's built, how to install it cleanly, how to operate it day to day across harnesses, how to make it learn, how to keep it fast, and how to keep it safe. Go build — and let the skills compound.*

[← Troubleshooting & FAQ](18-troubleshooting-faq.md) · [Table of Contents](../README.md)
