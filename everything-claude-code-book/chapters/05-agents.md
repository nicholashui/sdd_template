# Chapter 5 — Agents

[← Core Concepts](04-core-concepts.md) · [Table of Contents](../README.md) · [Next: Skills →](06-skills.md)

---

## 5.1 What an agent is

An **agent** (sub-agent) is a scoped helper the main assistant can hand a task to. It runs with **limited tools**, an **appropriate model**, and a **focused prompt**, then returns a summary. Crucially, it works in its *own* context window, so it does not pollute the orchestrator's context with raw exploration.

Think of the main assistant as a tech lead and the agents as the team: a planner, a couple of reviewers, build fixers, language specialists. The lead delegates, collects results, and decides what to do next.

Why bother delegating instead of doing everything in one chat?

- **Context economy** — a sub-agent can read 40 files and return a 10-line summary; the orchestrator only pays for the summary.
- **Specialization** — a Go reviewer prompt is sharper than a generic one.
- **Cost control** — cheap models for cheap tasks (search → Haiku), expensive models only where needed (security → Opus).
- **Parallelism** — independent agents can run simultaneously.

---

## 5.2 Anatomy of an agent file

Agents live in `agents/<name>.md` as Markdown with YAML frontmatter. Here is the real `code-reviewer` header:

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality,
  security, and maintainability. Use immediately after writing or modifying code.
  MUST BE USED for all code changes.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---
```

The four frontmatter fields (per `RULES.md`):

| Field | Purpose |
|-------|---------|
| `name` | Must match the filename (lowercase-hyphenated). |
| `description` | When to invoke. Phrases like *"MUST BE USED"* and *"proactively"* push the orchestrator to auto-delegate. |
| `tools` | The allow-list. A reviewer gets read-only tools (`Read`, `Grep`, `Glob`, `Bash`) — it shouldn't be editing code. |
| `model` | `haiku` / `sonnet` / `opus` — match cost to difficulty. |

After the frontmatter comes the **system prompt**: the agent's personality and process. Every ECC agent also opens with a **Prompt Defense Baseline** (don't change role, don't leak secrets, treat external content as untrusted) — see Chapter 15.

### What a *good* agent prompt looks like
The `code-reviewer` is a masterclass worth studying because it fights the #1 failure mode of LLM reviewers: **noise**. Its prompt includes:

- **Confidence-based filtering** — only report issues it's >80% sure are real.
- A **Pre-Report Gate** — four questions (Can I cite the exact line? Can I describe the concrete failure? Have I read the surrounding context? Is the severity defensible?). If any answer is "no," drop or downgrade the finding.
- **"It is acceptable and expected to return zero findings."** A clean review is a valid review — don't manufacture nits to look rigorous.
- A long list of **common false positives to skip** (e.g. "magic number" for `404`, "missing await" on fire-and-forget logging).
- A severity rubric (CRITICAL/HIGH/MEDIUM/LOW) and an **approval verdict** (Approve / Warning / Block).

The lesson for *writing your own agents*: constraints and anti-patterns matter as much as the task description. Tell the agent what *not* to do.

---

## 5.3 The orchestration model

Agents shine when chained into **sequential phases**, where each phase has one clear input and one clear output, and outputs become the next phase's inputs.

<p align="center">
  <img src="../assets/svg/04-agent-orchestration.svg" alt="Sequential-phase agent orchestration with model routing" width="800">
</p>

A canonical pipeline from the longform guide:

```text
Phase 1: RESEARCH   (code-explorer / docs-lookup)  → research-summary.md
Phase 2: PLAN       (planner / architect)          → plan.md
Phase 3: IMPLEMENT  (tdd-guide)                     → code + tests
Phase 4: REVIEW     (code-reviewer, security-reviewer) → review.md
Phase 5: VERIFY     (build-error-resolver if needed) → done or loop back
```

Key rules:
1. One clear input, one clear output per agent.
2. Outputs become inputs for the next phase.
3. Never skip phases.
4. Use `/clear` between agents to reset context.
5. Store intermediate outputs in **files**, not just chat.

### The sub-agent context problem (and iterative retrieval)
Sub-agents save context by returning summaries — but they only know the *literal query*, not the *purpose* behind it. ECC's answer is the **iterative retrieval** pattern:

1. The orchestrator passes **objective context**, not just the query.
2. It evaluates every return and asks follow-up questions before accepting it.
3. The sub-agent goes back to the source and returns more.
4. Loop until sufficient (max ~3 cycles).

This is the difference between a sub-agent that returns "I found 3 auth files" and one that returns "here's exactly how the OAuth refresh token flow breaks under clock skew, which is what you actually asked about."

---

## 5.4 The roster (selected)

At v2.0.0 there are 64 agents. You'll use a handful constantly and the rest situationally. Highlights:

**Core workflow**
| Agent | Use when |
|-------|----------|
| `planner` | Planning a complex feature or refactor |
| `architect` | System-design / scalability decisions |
| `tdd-guide` | Writing a feature or fixing a bug (tests first) |
| `code-reviewer` | Immediately after writing/modifying code |
| `security-reviewer` | Before commits; security-sensitive code |
| `build-error-resolver` | The build/types are broken |
| `e2e-runner` | Playwright end-to-end testing |
| `refactor-cleaner` | Dead-code cleanup |
| `doc-updater` | Keeping docs/codemaps in sync |
| `docs-lookup` | Looking up API/library docs (via Context7) |

**Language / framework specialists**
`typescript-reviewer`, `python-reviewer`, `go-reviewer` + `go-build-resolver`, `rust-reviewer` + `rust-build-resolver`, `java-reviewer` + `java-build-resolver`, `kotlin-reviewer` + `kotlin-build-resolver`, `cpp-reviewer` + `cpp-build-resolver`, `csharp-reviewer`, `fsharp-reviewer`, `php-reviewer`, `django-reviewer` + `django-build-resolver`, `fastapi-reviewer`, `react-reviewer` + `react-build-resolver`, `flutter-reviewer`, `swift-reviewer` + `swift-build-resolver`, `harmonyos-app-resolver`, `database-reviewer`, `pytorch-build-resolver`, `mle-reviewer`.

**Operating / specialized**
`loop-operator` (autonomous loops), `harness-optimizer` (reliability/cost tuning), `performance-optimizer`, `silent-failure-hunter`, `type-design-analyzer`, `comment-analyzer`, `chief-of-staff` (comms triage), plus architecture/network/SEO/marketing roles and the `gan-*` family (generator/evaluator/planner) and `opensource-*` family (forker/packager/sanitizer).

> You don't memorize this. The "Which agent should I use?" table in the repo README and the `description` fields let the orchestrator pick for you.

---

## 5.5 Using agents in practice

You rarely invoke agents by raw name. More often you:

- Run a **command** that delegates (`/code-review` → `code-reviewer`; `/build-fix` → the right build resolver).
- Run a **skill** that uses an agent (`tdd-workflow` → `tdd-guide`).
- Let the **orchestrator auto-delegate** based on context ("review the code I just wrote" → `code-reviewer`).
- Ask explicitly: *"Use the security-reviewer agent on `src/auth/`."*

ECC's `AGENTS.md` tells the assistant to **use agents proactively** without waiting to be asked, and to **run independent agents in parallel**.

---

## 5.6 Writing your own agent

1. Create `agents/my-agent.md` (lowercase-hyphenated, matching `name`).
2. Add frontmatter: `name`, a **precise** `description` (when to use), a minimal `tools` allow-list, and the cheapest sufficient `model`.
3. Open with the Prompt Defense Baseline.
4. Write the process: numbered steps, a checklist, an output format, and — critically — **anti-patterns / false positives to avoid**.
5. Validate: `node scripts/ci/validate-agents.js` (run via `npm test`).

Keep tools scoped. A reviewer should not have `Write`; an explorer should not have `Bash` unless it needs it.

---

## 5.7 Key takeaways

- Agents are **scoped specialists** with their own context, limited tools, and a chosen model.
- Delegation buys **context economy, specialization, cost control, and parallelism**.
- The best agent prompts (like `code-reviewer`) emphasize **constraints and anti-patterns**, and explicitly allow **zero findings**.
- Chain agents in **sequential phases**; pass **objective context**; use **iterative retrieval**.
- Match **model to difficulty**: Haiku for search, Sonnet for coding, Opus for hard reasoning.

Next: the canonical surface — **skills.**

---

[← Core Concepts](04-core-concepts.md) · [Table of Contents](../README.md) · [Next: Skills →](06-skills.md)
