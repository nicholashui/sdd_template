# Chapter 7 — Commands

[← Skills](06-skills.md) · [Table of Contents](../README.md) · [Next: Hooks →](08-hooks.md)

---

## 7.1 What commands are (and where they're going)

A **command** is a slash entry you type into your harness — `/plan`, `/code-review`, `/build-fix`. Each maps to a Markdown file in `commands/<name>.md` and triggers a workflow.

But here's the important framing: **commands are a compatibility layer.** ECC is deliberately migrating durable logic into *skills* and treating `commands/` as "maintained slash-entry compatibility during migration." Retired short names (like `/tdd` and `/eval`) have moved into `legacy-command-shims/` for explicit opt-in only.

So why do commands still exist? Because typing `/plan` is faster and more discoverable than describing a workflow, and because cross-harness parity sometimes needs a named entry. Think of commands as **ergonomic shortcuts** over the real engine (skills).

<p align="center">
  <img src="../assets/svg/05-surfaces.svg" alt="Skill vs command vs hook" width="780">
</p>

### Plugin vs manual naming
- **Plugin install** uses the canonical namespaced form: `/ecc:plan`.
- **Manual install** keeps the shorter slash form: `/plan`.

Both reach the same logic.

---

## 7.2 The command cheat sheet

The repo ships `COMMANDS-QUICK-REF.md`. Here are the commands grouped by job. (Exact availability depends on your install and harness; type `/` to see what's live.)

### Core workflow
| Command | What it does |
|---------|-------------|
| `/plan` | Restate requirements, assess risks, write a step-by-step plan — **waits for your confirm before touching code** |
| `/code-review` | Full quality + security + maintainability review of changed files |
| `/build-fix` | Detect and fix build errors; delegates to the right build-resolver |
| `/quality-gate` | Run the verification gate against project standards |
| `/refactor-clean` | Remove dead code, consolidate duplicates |

### Testing
`/test-coverage`, plus language TDD entries: `/go-test`, `/rust-test`, `/kotlin-test`, `/cpp-test`, `/react-test`, `/flutter-test`. (The universal `/tdd` lives in `legacy-command-shims/`; prefer the `tdd-workflow` skill.)

### Code review (per language)
`/python-review`, `/go-review`, `/rust-review`, `/kotlin-review`, `/cpp-review`, `/react-review`, `/fastapi-review`, `/flutter-review`.

### Build fixers (per language)
`/go-build`, `/rust-build`, `/kotlin-build`, `/cpp-build`, `/gradle-build`, `/react-build`, `/flutter-build`.

### Planning & multi-agent
`/plan`, `/plan-prd`, `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, `/multi-workflow`, and the `orch-*` family (`/orch-build-mvp`, `/orch-add-feature`, `/orch-fix-defect`, `/orch-change-feature`, `/orch-refine-code`).

### Sessions & context
`/save-session`, `/resume-session`, `/sessions`, `/checkpoint`, `/aside` (quick side question without losing your task), `/context-budget`.

### Learning & improvement
`/learn`, `/learn-eval`, `/evolve`, `/promote`, `/instinct-status`, `/instinct-import`, `/instinct-export`, `/skill-create`, `/skill-health`, `/rules-distill`, `/prune`, `/projects`.

### Docs & research
`/docs` (Context7 lookup), `/update-docs`, `/update-codemaps`.

### Loops & automation
`/loop-start`, `/loop-status`, `/claw` (NanoClaw v2 REPL), `/santa-loop`.

### Harness & infra
`/harness-audit`, `/model-route`, `/pm2`, `/setup-pm`, `/cost-report`, `/auto-update`, `/hookify` (+ `/hookify-list`, `/hookify-configure`, `/hookify-help`), `/project-init`.

### PR workflow
`/pr`, `/review-pr`, `/pr-test-analyzer` (agent), and the `prp-*` family (`/prp-prd`, `/prp-plan`, `/prp-implement`, `/prp-commit`, `/prp-pr`).

---

## 7.3 A quick decision guide

From the quick-ref, a handy mental flowchart:

```text
Starting a new feature?          → /plan first, then the tdd-workflow skill
Code just written?               → /code-review
Build broken?                    → /build-fix
Need live docs?                  → /docs <library>
Session about to end?            → /save-session  (or /learn-eval)
Resuming next day?               → /resume-session
Context getting heavy?           → /context-budget then /checkpoint
Want to capture what you learned? → /learn-eval then /evolve
Running repeated tasks?          → /loop-start
```

---

## 7.4 Legacy shims: what changed

Some old favorites were retired as standalone short commands and now point you at the skill:

| Old shim | Prefer instead |
|----------|----------------|
| `/tdd` | `tdd-workflow` skill |
| `/e2e` | `e2e-testing` skill |
| `/eval` | `eval-harness` skill |
| `/verify` | `verification-loop` skill |
| `/orchestrate` | `dmux-workflows` or `/multi-workflow` |

They live in `legacy-command-shims/` and are opt-in. If your muscle memory wants `/tdd`, copy that single shim — but know the skill is the real thing.

---

## 7.5 Authoring a command

Commands are the simplest block: a Markdown file with a `description` in frontmatter and the prompt/instructions in the body. Per ECC's policy, though, **only add or update a command when a shim is genuinely needed** for migration or cross-harness parity — otherwise put the logic in a skill. Validate with `node scripts/ci/validate-commands.js`.

---

## 7.6 Key takeaways

- Commands are typed slash shortcuts; ECC is **skills-first**, so they're a compatibility layer.
- Plugin form is `/ecc:plan`; manual form is `/plan` — same engine.
- `COMMANDS-QUICK-REF.md` groups them by job; type `/` to see what's installed.
- Retired short names live in `legacy-command-shims/` and point back to skills.
- Prefer creating **skills** over new commands.

Next: the automations that fire without you — **hooks.**

---

[← Skills](06-skills.md) · [Table of Contents](../README.md) · [Next: Hooks →](08-hooks.md)
