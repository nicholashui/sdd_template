# Chapter 16 — ECC 2.0 & the Operator CLI

[← Security](15-security.md) · [Table of Contents](../README.md) · [Next: Dashboard & Tooling →](17-dashboard-and-tooling.md)

---

So far we've treated ECC as a *catalog you install into one harness*. ECC 2.0 introduces a layer **above** that: a way to operate **many agent sessions** from one surface. This chapter covers the Rust control-plane prototype (`ecc2/`) and the `ecc` operator CLI you can use today.

## 16.1 The motivation

Once you're running several agents — different worktrees, different harnesses, some looping autonomously — you need answers to operator questions: *Which sessions are running? Which stalled? Which need review? What's the risk? Where did I leave off?* That's the job of a **control plane**.

<p align="center">
  <img src="../assets/svg/12-ecc2-control-plane.svg" alt="ECC 2.0 control plane managing multiple sessions" width="800">
</p>

> ECC 2.0 is the layer above individual harness installs: manage many agent sessions, keep state/output/risk visible, add orchestration and review controls — Claude Code first, without blocking future harness interoperability.

---

## 16.2 `ecc2/` — the Rust control-plane (alpha)

`ecc2/` is the current Rust-based ECC 2.0 scaffold. The repo is **honest about its status**, and you should be too:

- It is **real code**, **alpha quality**, valid to build and test locally.
- It is **not** the finished ECC 2.0 product. The repo even has a rule: *don't market `ecc2/` as done just because the scaffold builds.*

### What exists today
- A **terminal UI dashboard**.
- A **session store backed by SQLite**.
- Session **start / stop / resume** flows.
- A **background daemon** mode.
- **Observability and risk-scoring** primitives.
- **Worktree-aware** session scaffolding.
- Basic **multi-session state and output tracking**.

### What's still missing
Richer multi-agent orchestration, explicit agent-to-agent delegation/summaries, a visual worktree/diff review surface, stronger external-harness compatibility, deeper memory/roadmap-aware planning, and a release/installer story.

### Trying the alpha
From the repo root:
```bash
cd ecc2
cargo run -- dashboard                       # launch the TUI dashboard
cargo run -- start --task "audit the repo and propose fixes" --agent claude --worktree
cargo run -- sessions                        # list sessions
cargo run -- status latest                   # inspect a session
cargo run -- stop <session-id>               # stop
cargo run -- resume <session-id>             # resume a stopped/failed session
cargo run -- daemon                          # run the daemon loop
cargo test                                   # validate
```

Think of it as a preview of where ECC is heading: from "configs for one assistant" to "an operations console for a fleet of agents."

---

## 16.3 The `ecc` operator CLI (use this today)

You don't need the Rust alpha to get operator features — the Node-based `ecc` CLI (`scripts/ecc.js`) is stable and ships with the package. Its bins (from `package.json`):

| Bin | Script | Role |
|-----|--------|------|
| `ecc` | `scripts/ecc.js` | The main operator/lifecycle CLI |
| `ecc-install` | `scripts/install-apply.js` | The selective-install applier |
| `ecc-control-pane` | `scripts/control-pane.js` | Control-pane substrate |

### Lifecycle & health (Chapter 3 recap)
```bash
node scripts/ecc.js list-installed     # what ECC installed
node scripts/ecc.js doctor             # diagnose problems
node scripts/ecc.js repair             # restore ECC-managed files
node scripts/ecc.js uninstall --dry-run
```

### Discovery & install
```bash
npx ecc consult "security reviews" --target claude     # find matching components
npx ecc install --profile minimal --target claude --with capability:machine-learning
```

### Operator status snapshots
A genuinely useful feature for teams and handoffs — turn local state into a portable Markdown report:
```bash
npx ecc status --markdown --write status.md
```
It covers readiness, active sessions, skill-run health, install health, pending governance events, and linked work items. Related commands:
```bash
npx ecc work-items upsert ...                       # manual work-item entries
npx ecc work-items sync-github --repo owner/repo     # pull PR/issue queue state
npx ecc status --exit-code                           # fail automation when readiness needs attention
```

---

## 16.4 Orchestration & autonomous loops

ECC includes tooling for running and supervising agent loops and parallel work:

- **`/loop-start`, `/loop-status`** — start and inspect controlled agentic loops; the `loop-operator` agent monitors for stalls and intervenes.
- **`/claw`** — NanoClaw v2, a persistent REPL with model routing, skill hot-load, session branch/search/export/compact/metrics.
- **`autonomous-loops` skill** — patterns for sequential pipelines, PR loops, and DAG orchestration (with guards against runaway observer loops).
- **`scripts/orchestrate-worktrees.js`** / `npm run orchestrate:tmux` — tmux + worktree multi-agent orchestration.
- **`/harness-audit`** (`npm run harness:audit`) — score your harness setup for reliability, eval readiness, and risk; the `harness-optimizer` agent tunes it.

These are powerful and a little dangerous — re-read Chapter 15 before running anything autonomously.

---

## 16.5 npm scripts worth knowing

The `package.json` exposes operator/CI scripts. A sampler:

```bash
npm test                      # full validation: unicode safety, agent/command/rule/skill/hook
                              # validators, catalog + command-registry checks, then tests/run-all.js
npm run dashboard             # launch the desktop GUI (Chapter 17)
npm run harness:audit         # harness reliability/risk scoring
npm run observability:ready   # observability readiness check
npm run operator:dashboard    # operator readiness dashboard
npm run control:pane          # control-pane substrate
npm run security:ioc-scan     # supply-chain IOC scan
npm run claw                  # NanoClaw v2
npm run orchestrate:status    # orchestration status
```

---

## 16.6 Key takeaways

- ECC 2.0 is the **operator layer above individual installs** — manage many sessions, see state/risk, orchestrate.
- **`ecc2/`** (Rust) is a real but **alpha** control plane: `cargo run -- dashboard|start|sessions|status|stop|resume|daemon`.
- The **`ecc` CLI** is stable today: `consult`, `install`, `doctor`, `repair`, `list-installed`, `uninstall`, and `status --markdown`.
- Orchestration tooling (`/loop-start`, `/claw`, worktree orchestration, `/harness-audit`) exists — use it carefully.

Next: the friendly front door — the desktop dashboard and ecosystem tools.

---

[← Security](15-security.md) · [Table of Contents](../README.md) · [Next: Dashboard & Tooling →](17-dashboard-and-tooling.md)
