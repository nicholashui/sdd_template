# Chapter 11 — Everyday Workflows

[← MCP & Context](10-mcp-and-context.md) · [Table of Contents](../README.md) · [Next: Cross-Harness Use →](12-cross-harness.md)

---

This is the chapter you'll come back to. It turns all the components into concrete, repeatable loops. Copy these, adapt them, and they become muscle memory.

## 11.1 The master loop: plan → TDD → review → verify → learn

Almost every ECC session follows the same shape.

<p align="center">
  <img src="../assets/svg/11-feature-workflow.svg" alt="End-to-end feature workflow with ECC" width="800">
</p>

```text
1. Plan        /plan "add OAuth login"        → planner agent → plan.md (you confirm)
2. TDD         tdd-workflow skill             → RED → GREEN → refactor (tdd-guide)
3. Review      /code-review + /security-scan  → code-reviewer + security-reviewer
4. Verify      /quality-gate, /build-fix      → /test-coverage ≥ 80%
5. Learn       /learn-eval, /save-session     → instinct + session summary (Stop hook)
```

Around all of it, **hooks** format/typecheck/secret-scan invisibly, and **rules** constrain every step. Between phases, use `/clear` and store intermediate outputs as files so you don't drown the context window.

---

## 11.2 Recipe: starting a new feature

```text
/ecc:plan "Add user authentication with OAuth"
   → planner produces a phased implementation blueprint; you approve

(invoke the tdd-workflow skill)
   → tdd-guide: write failing tests first, then minimal implementation

/code-review
   → code-reviewer checks the diff (and returns zero findings if it's clean)
```

Why this order? **Plan-before-execute** stops scope sprawl. **Tests-first** means the implementation is guided by a spec. **Review-immediately** catches issues while context is fresh.

---

## 11.3 Recipe: fixing a bug

```text
(invoke tdd-workflow)
   → tdd-guide: write a failing test that REPRODUCES the bug (valid RED state)
   → implement the fix; confirm the test goes GREEN

/code-review
   → code-reviewer: catch regressions
```

The discipline here is the **RED gate** from Chapter 6: you must have a test that genuinely fails for the intended reason *before* touching production code. No reproduction, no fix.

---

## 11.4 Recipe: preparing for production

```text
/security-scan        → security-reviewer: OWASP-aligned audit (or AgentShield)
(invoke e2e-testing)  → e2e-runner: critical user-flow tests (Playwright)
/test-coverage        → verify 80%+ coverage
/quality-gate         → final gate against project standards
```

---

## 11.5 Recipe: orchestrating a bigger build with sub-agents

For multi-phase work, lean on sequential-phase orchestration (Chapter 5):

<p align="center">
  <img src="../assets/svg/04-agent-orchestration.svg" alt="Sequential-phase orchestration" width="780">
</p>

```text
Phase 1 RESEARCH   → research-summary.md   (cheap model)
Phase 2 PLAN       → plan.md               (Opus for hard design)
Phase 3 IMPLEMENT  → code + tests          (Sonnet)
Phase 4 REVIEW     → review.md
Phase 5 VERIFY     → done or loop back to the failing phase
```

The `orch-*` commands (`/orch-build-mvp`, `/orch-add-feature`, `/orch-fix-defect`, …) package these patterns. For multi-model collaboration, the `multi-*` commands exist (remember they need the `ccg-workflow` runtime — Chapter 3).

---

## 11.6 Parallelization: doing more at once

When one session isn't enough, ECC's guidance (from the longform guide) is deliberate, not "spin up 10 terminals."

**Fork for non-overlapping work.** Use `/fork` to branch a conversation for questions/research while your main chat keeps editing code. Keep code changes in the main chat; use forks for read-only exploration.

**Git worktrees for overlapping code work.** When multiple instances must edit overlapping code, give each its own checkout:
```bash
git worktree add ../feature-a feature-a
git worktree add ../feature-b feature-b
cd ../feature-a && claude      # one instance per worktree
```
Name your chats with `/rename` so you don't lose track.

**The cascade method.** Open new tasks in tabs to the right, sweep left-to-right (oldest→newest), and focus on at most **3–4 tasks** at a time.

> The guiding principle: *"How much can you get done with the minimum viable amount of parallelization?"* Add a terminal only out of true necessity.

---

## 11.7 Recipe: the two-instance project kickoff

A nice pattern from the longform guide for greenfield work — two Claude instances on an empty repo:

- **Instance 1 — Scaffolding agent:** lays down project structure and configs (`CLAUDE.md`, rules, agents).
- **Instance 2 — Deep research agent:** connects to services and web search, writes the PRD, draws architecture diagrams, and collects real documentation clips (grab an `llms.txt` if the docs site offers one).

Then they converge: the scaffold meets the researched plan.

---

## 11.8 Recipe: end-of-day handoff

Don't let a session evaporate. Capture it:
```text
/learn-eval       # extract reusable patterns AND self-evaluate them before saving
/save-session     # snapshot state to session-data/
```
Or rely on the **Stop hook** to write a summary automatically. Next morning:
```text
/resume-session   # reload the latest session and continue
```
For a portable, shareable status (great for standups or handing off to a teammate):
```bash
npx ecc status --markdown --write status.md
```

---

## 11.9 Verification loops & evals

ECC treats verification as a first-class workflow, not an afterthought. Two eval styles (longform guide):

- **Checkpoint-based** — set explicit checkpoints, verify against criteria, fix before proceeding.
- **Continuous** — run every N minutes or after major changes (full test suite + lint).

And two ways to read reliability:
```text
pass@k : at least ONE of k attempts succeeds   (use when you just need it to work)
pass^k : ALL k attempts succeed                 (use when consistency is essential)
```
The `eval-harness` and `verification-loop` skills implement these; `/quality-gate` is the everyday gate.

---

## 11.10 A few high-leverage habits

From the guides, small things with big payoff:
- **Disable auto-compact**, compact strategically at logical breaks.
- **Run long commands in `tmux`** so you can detach/reattach and stream logs (ECC even reminds you to).
- **Use `mgrep`** over grep to halve search tokens.
- **Set up a status line** (`/statusline`) showing branch, context %, model, and todos.
- **Keep MCPs lean** (<10 / <80) per project.
- **Review diffs before committing** — let the `git push` hook gate you.

---

## 11.11 Key takeaways

- The master loop is **plan → TDD → review → verify → learn**, wrapped in hooks and rules.
- Reproduce bugs with a **valid RED test** before fixing.
- Orchestrate big work in **sequential phases**, passing files between agents.
- Parallelize with **`/fork`, git worktrees, and the cascade method** — minimally.
- **Capture every session** (`/learn-eval`, `/save-session`, Stop hook) so tomorrow starts ahead.
- Verify with **checkpoint/continuous evals** and **pass@k vs pass^k** thinking.

Next: how all of this travels across different AI tools.

---

[← MCP & Context](10-mcp-and-context.md) · [Table of Contents](../README.md) · [Next: Cross-Harness Use →](12-cross-harness.md)
