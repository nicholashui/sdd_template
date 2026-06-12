# Chapter 6 — Skills

[← Agents](05-agents.md) · [Table of Contents](../README.md) · [Next: Commands →](07-commands.md)

---

## 6.1 Why skills are the heart of ECC

If agents are *who* does the work, **skills are *how* the work is done**. A skill is a reusable, self-contained workflow: the steps, the structure, the examples, the gotchas, and sometimes supporting files and "codemaps" (lightweight maps of a codebase so the assistant can navigate without burning tokens re-exploring).

ECC is emphatic that **skills are the canonical workflow surface**:

> *New workflow development should land in `skills/` first.*

Commands still exist for compatibility, but the durable logic belongs in skills. The reason is the compounding-workflows philosophy from Chapter 1: a skill is reused forever, across projects and sessions, and gets better as models improve.

Three ways a skill gets used:
1. **You invoke it** by name.
2. **It's auto-suggested** when its `description` matches what you're doing.
3. **An agent reuses it** — a sub-agent that can execute a subset of your skills can be delegated tasks and use them autonomously.

---

## 6.2 Anatomy of a SKILL.md

Each skill lives in its own directory: `skills/<name>/SKILL.md`. The frontmatter (per `RULES.md`) is small:

```markdown
---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring
  code. Enforces test-driven development with 80%+ coverage including unit,
  integration, and E2E tests.
origin: ECC
---
```

| Field | Meaning |
|-------|---------|
| `name` | The skill id (matches the directory). |
| `description` | The "When to Use" trigger — drives auto-selection, so be concrete. |
| `origin` | `ECC` for first-party, `community` for imported/contributed. |

The body should include practical guidance, tested examples, and a clear **"When to Use"** section. A skill folder can hold more than `SKILL.md` — additional reference files, templates, and codemaps.

---

## 6.3 A real skill, dissected: `tdd-workflow`

The `tdd-workflow` skill is one of the most important in ECC and a great template for your own. Its structure:

1. **When to Activate** — new features, bug fixes, refactors, new endpoints/components.
2. **Core Principles** — tests before code; 80%+ coverage; the three test types (unit, integration, E2E).
3. **Git checkpoints** — commit after each TDD stage with evidence in the message, on the current branch.
4. **The 7 steps:**
   - Write user journeys → generate test cases → **run tests (they must FAIL)** → implement minimal code → **run tests (they pass)** → refactor → verify coverage.
5. **The RED gate** — a careful definition of what counts as a valid failing test (runtime RED or compile-time RED), so you can't fake it. *"A test that was only written but not compiled and executed does not count as RED."*
6. **Testing patterns** — concrete Jest/Vitest, API integration, and Playwright examples.
7. **Mocking** examples, **coverage thresholds**, **common mistakes to avoid** (don't test implementation details; use semantic selectors; isolate tests), and **success metrics**.

Notice how much of the skill is *rigor*: it doesn't just say "write tests," it defines exactly what a valid failing test is and refuses to let you skip the RED step. That precision is what makes a skill trustworthy enough to delegate to an agent.

---

## 6.4 The skill catalog (a tour, not a list)

There are 262+ skills. Memorizing them is pointless; knowing the *categories* is powerful. Representative clusters:

**Engineering core**
`tdd-workflow`, `verification-loop`, `eval-harness`, `security-review`, `security-scan`, `coding-standards`, `api-design`, `backend-patterns`, `frontend-patterns`, `database-migrations`, `deployment-patterns`, `docker-patterns`, `e2e-testing`, `error-handling`, `git-workflow`.

**Language / framework packs** (patterns + security + TDD + verification per stack)
Python, Go, Rust, Java (Spring Boot, Quarkus, JPA), Kotlin (coroutines, Ktor, Exposed, Compose Multiplatform), Swift (concurrency 6.2, actors, protocol DI, SwiftUI, Liquid Glass, on-device Foundation Models), C++, Perl, Django, Laravel, NestJS, React (patterns/performance/testing), Next.js + Turbopack, Bun, Flutter/Dart, Android clean architecture.

**Context & cost engineering**
`strategic-compact`, `context-budget`, `token-budget-advisor`, `iterative-retrieval`, `cost-aware-llm-pipeline`, `content-hash-cache-pattern`, `regex-vs-llm-structured-text`.

**Learning & meta**
`continuous-learning`, `continuous-learning-v2`, `skill-stocktake`, `rules-distill`, `agent-eval`, `agent-harness-construction`, `codebase-onboarding`, `configure-ecc`.

**Orchestration & loops**
`autonomous-loops`, `continuous-agent-loop`, `dmux-workflows`, `plan-orchestrate`, `nanoclaw-repl`, `claude-devfleet`.

**Research, content & operator**
`deep-research`, `search-first`, `market-research`, `article-writing`, `content-engine`, `crosspost`, `investor-materials`, `frontend-slides`, `videodb`, `video-editing`, `fal-ai-media`, plus domain packs (healthcare, logistics, customs, energy, manufacturing) and the Itô prediction-market pack.

> The point of the tour: whatever you're doing, there's likely a skill for it. Use `npx ecc consult "<your need>"` to find it.

---

## 6.5 Where skills are stored (placement policy)

ECC distinguishes **curated** skills (in the repo's `skills/`) from **generated/imported** skills (under your home config, e.g. `~/.claude/skills/`). The placement policy:

- Claude Code loads skills only from **direct children** of `~/.claude/skills/`. Don't nest manual installs under `~/.claude/skills/ecc/`.
- For new users doing a manual install: copy the core/general skills, plus `search-first`, and add niche packs only when needed.
- Generated skills (from `/skill-create`) and learned skills land under your agent data home.

See `docs/SKILL-PLACEMENT-POLICY.md` and `docs/SKILL-DEVELOPMENT-GUIDE.md` in the repo for the authoritative rules.

---

## 6.6 Creating skills

Two routes:

**Manual** — create `skills/my-skill/SKILL.md` with frontmatter (`name`, `description`, `origin`) and a body with "When to Use," steps, and tested examples. Validate with `node scripts/ci/validate-skills.js` (part of `npm test`).

**Generated from your git history** — let ECC mine your repo:
```bash
/skill-create               # analyze current repo → SKILL.md files
/skill-create --instincts   # also generate instincts for continuous-learning-v2
```
This reads your commit history locally and extracts reusable patterns. (An advanced GitHub App route exists for very large repos and team sharing.)

---

## 6.7 Key takeaways

- **Skills are the canonical, durable workflow surface** — new logic belongs here.
- A skill = a directory with `SKILL.md` (frontmatter `name`/`description`/`origin`) + body + optional codemaps.
- Great skills are **rigorous** — `tdd-workflow` even defines what a valid failing test is.
- There are 262+ skills across engineering, language packs, context engineering, learning, orchestration, and operator domains.
- Find skills with `npx ecc consult`; create them manually or with `/skill-create`.

Next: the slash entries you type — **commands.**

---

[← Agents](05-agents.md) · [Table of Contents](../README.md) · [Next: Commands →](07-commands.md)
