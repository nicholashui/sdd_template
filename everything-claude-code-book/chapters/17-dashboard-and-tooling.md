# Chapter 17 — Dashboard & Ecosystem Tooling

[← ECC 2.0 & the CLI](16-ecc2-and-cli.md) · [Table of Contents](../README.md) · [Next: Troubleshooting & FAQ →](18-troubleshooting-faq.md)

---

ECC is mostly a terminal experience, but it also ships a graphical front door and a small ecosystem of companion tools. This short chapter covers the friendly surfaces.

## 17.1 The desktop dashboard

`ecc_dashboard.py` is a **Tkinter desktop GUI** for visually exploring everything in the catalog. Launch it:

```bash
npm run dashboard
# or
python3 ./ecc_dashboard.py
```

Features:
- **Tabbed interface** — Agents, Skills, Commands, Rules, Settings.
- **Search and filter** across all components.
- **Dark / light theme** toggle.
- **Font customization** (family and size).
- Project logo in the header and taskbar.

It's the easiest way to browse 64 agents and 262 skills without `cat`-ing Markdown files, and a nice way for a new teammate to get oriented.

> It requires Python 3 with Tkinter available. If `npm run dashboard` can't find it, run `python3 ./ecc_dashboard.py` directly and confirm Tkinter is installed for your Python.

---

## 17.2 The Skill Creator

Two ways to generate skills from a repository (also covered in Chapter 13):

- **Local (built-in):** `/skill-create` analyzes your git history locally and writes `SKILL.md` files. Add `--instincts` to also seed continuous-learning-v2. No external service.
- **GitHub App (advanced):** ECC Tools for very large repos (10k+ commits), auto-PRs, and team sharing — via the marketplace app at `ecc.tools`.

Both produce ready-to-use skills, instinct collections, and pattern extraction from your commit history.

---

## 17.3 AgentShield

Covered in depth in [Chapter 15](15-security.md). The one-liner: a security auditor for your agent config, runnable as `npx ecc-agentshield scan`, with an `--opus` red-team/blue-team/auditor mode and a CI-friendly exit code. Use `/security-scan` inside the harness.

---

## 17.4 Skill / harness health and audits

A cluster of tools keeps your setup honest over time:

```text
/skill-health         # skill portfolio health dashboard with analytics
/skill-stocktake      # audit skills & commands for quality
/harness-audit        # score harness reliability, eval readiness, risk
/rules-distill        # extract cross-cutting principles from skills → rules
```
```bash
npm run harness:audit          # CLI form of /harness-audit
npm run observability:ready    # observability readiness
npm run operator:dashboard     # operator readiness dashboard
```

These are how you prevent skill sprawl and config drift as your catalog grows.

---

## 17.5 Package-manager setup

ECC auto-detects your package manager (npm/pnpm/yarn/bun) in priority order: `CLAUDE_PACKAGE_MANAGER` env → `.claude/package-manager.json` → `package.json` `packageManager` field → lock file → global config → first available. To set it explicitly:

```bash
export CLAUDE_PACKAGE_MANAGER=pnpm
node scripts/setup-package-manager.js --global pnpm
node scripts/setup-package-manager.js --project bun
node scripts/setup-package-manager.js --detect
# or in-harness:
/setup-pm
```

---

## 17.6 Editor pairing (a productivity note)

The shortform guide is opinionated about editors because the editor shapes the Claude Code experience:
- **Zed** (the author's preference) — Rust-fast, real-time file-change tracking via its agent panel, quick command palette, low resource use (matters when running Opus).
- **VS Code / Cursor** — works well; use the terminal with `/ide` for LSP, or the integrated extension.

Editor-agnostic tips: split screen (assistant + editor), enable autosave so file reads are current, use git integration to review diffs before committing, and confirm file watchers auto-reload changed files.

---

## 17.7 The ecosystem at a glance

| Tool | What it is | Entry |
|------|-----------|-------|
| Desktop dashboard | Tkinter GUI to browse the catalog | `npm run dashboard` |
| Skill Creator | Generate skills from git history | `/skill-create` |
| AgentShield | Security auditor | `npx ecc-agentshield scan` / `/security-scan` |
| ECC Tools (GitHub App) | Hosted analysis, PR audits, private repos | `ecc.tools` / marketplace |
| NanoClaw v2 | Persistent REPL w/ routing + metrics | `/claw` / `npm run claw` |
| `ecc` CLI | Operator/lifecycle | `npx ecc …` |
| ECC 2.0 (`ecc2/`) | Rust control plane (alpha) | `cargo run` |

> The OSS repo is MIT-licensed and free forever. ECC Pro / ECC Tools (the hosted GitHub App) and GitHub Sponsors fund the work — that's how a single maintainer ships weekly across many harnesses. You never *need* the paid pieces to use everything in this book.

---

## 17.8 Key takeaways

- **`npm run dashboard`** opens a Tkinter GUI to browse agents/skills/commands/rules.
- **`/skill-create`** generates skills from your git history (locally, no service needed).
- Keep your setup healthy with **`/skill-health`, `/skill-stocktake`, `/harness-audit`, `/rules-distill`**.
- Set your package manager via **`/setup-pm`** or `CLAUDE_PACKAGE_MANAGER`.
- The OSS core is free; hosted tools are optional.

Next: when things go wrong — troubleshooting and the FAQ.

---

[← ECC 2.0 & the CLI](16-ecc2-and-cli.md) · [Table of Contents](../README.md) · [Next: Troubleshooting & FAQ →](18-troubleshooting-faq.md)
