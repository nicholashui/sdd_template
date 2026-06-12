# Chapter 13 — Continuous Learning

[← Cross-Harness Use](12-cross-harness.md) · [Table of Contents](../README.md) · [Next: Token Optimization →](14-token-optimization.md)

---

## 13.1 The problem it solves

You've all felt this: you correct the assistant about the same thing three days in a row. It hits the same bug, you give it the same workaround, it forgets, repeat. That's **wasted tokens, wasted context, wasted time**.

ECC's answer: when the assistant discovers something non-trivial — a debugging technique, a project-specific quirk, a workaround — it should **save that as reusable knowledge**, so next time the pattern loads automatically. The catalog grows from your own usage.

<p align="center">
  <img src="../assets/svg/09-memory-learning.svg" alt="Memory persistence and the continuous-learning loop" width="800">
</p>

> **Memory vs. learning** (don't conflate them — they're the right half and the engine of that diagram):
> - **Memory** (Chapter 9) = *this project's state* carried between sessions.
> - **Continuous learning** = *durable patterns* extracted into instincts and skills that apply across sessions and projects.

---

## 13.2 Two generations

ECC ships two systems, and you should know which you're using:

| | continuous-learning (v1) | continuous-learning-v2 |
|---|---------------------------|------------------------|
| Mechanism | Stop-hook extracts patterns into learned skills | **Instinct-based** with confidence scoring |
| Strength | Simple, proven | Import/export, evolution, scoring |
| Keep v1 when | You explicitly want the legacy learned-skill flow | — |
| Default | — | **Prefer v2** |

The v2 system lives in `skills/continuous-learning-v2/` and is the recommended path. Keep v1 (`skills/continuous-learning/`) only if you specifically want its Stop-hook learned-skill behavior.

---

## 13.3 Instincts: the unit of learning

An **instinct** is a small, scored piece of learned behavior: an observation plus an action, with a **confidence score** and supporting evidence/examples. Instincts accumulate quietly as you work (the `observe-runner` hooks capture tool-use signals), and you manage them with commands:

```text
/instinct-status     # show learned instincts with confidence scores (project + global)
/instinct-import     # import instincts from a file or URL (or from a teammate)
/instinct-export     # export your instincts for sharing
/prune               # delete expired pending instincts (30-day TTL)
/promote             # promote project-scoped instincts to global scope
/projects            # list known projects and their instinct stats
```

Instincts are scoped: an instinct learned in one project stays *project-scoped* until you `/promote` it to *global*. This keeps project quirks from leaking everywhere while still letting genuinely universal lessons graduate.

> **Note on internals:** instinct storage is separate from session memory — by default under `~/.local/share/ecc-homunculus` (overridable via `CLV2_HOMUNCULUS_DIR`). So clearing sessions doesn't wipe what you've learned.

---

## 13.4 From instincts to skills: `/evolve`

Individual instincts are useful, but the real magic is **clustering related instincts into a brand-new skill**. That's what `/evolve` does:

```text
/learn          # extract reusable patterns from the current session
/learn-eval     # extract patterns AND self-evaluate their quality before saving
/evolve         # analyze learned instincts → suggest evolved skill structures
```

The loop, end to end:

```text
repeated pattern observed (hooks)
        ↓
saved as an instinct (+confidence)
        ↓
/evolve clusters related instincts → a new SKILL.md
        ↓
the new skill auto-loads next time the situation matches
```

This is how a generic assistant becomes *your* assistant: the things you keep teaching it congeal into skills that are always there.

---

## 13.5 Generating skills from git history

A complementary path that doesn't wait for instincts to accumulate — mine your existing repo:

```bash
/skill-create               # analyze current repo git history → SKILL.md files
/skill-create --instincts   # also generate instincts for continuous-learning-v2
```

It reads your commit history locally and extracts patterns into ready-to-use skills. For very large repos (10k+ commits), team sharing, or auto-PRs, there's an advanced GitHub App route (ECC Tools), but `/skill-create` covers the common case with no external service.

You can also audit the health of your accumulated knowledge:
```text
/skill-health      # skill portfolio health dashboard with analytics
/skill-stocktake   # audit skills/commands for quality (a skill)
/rules-distill     # scan skills, extract cross-cutting principles → distill into rules
```

---

## 13.6 Why a Stop hook, not every prompt

Worth repeating because it's a thoughtful design choice: learning capture runs on the **Stop** event (once at session end) rather than **UserPromptSubmit** (every message). Running it per-message would add latency to *every* prompt. Stop runs once, lightweight, out of your way. The `observe-runner` hooks do capture lightweight signals during the session (async, short timeout), but the heavy extraction happens at the end.

---

## 13.7 A practical adoption path

You don't need to do all of this on day one. A sane ramp:

1. **Week 1:** just work. Let instincts accumulate. Occasionally run `/instinct-status` to see what it's noticing.
2. **Week 2:** at the end of meaty sessions, run `/learn-eval`, then `/save-session`.
3. **Week 3:** run `/evolve` to turn clusters of instincts into skills; `/skill-health` to check quality.
4. **Ongoing:** `/promote` the genuinely universal lessons to global; `/instinct-export` to share with teammates; `/prune` to keep it tidy.

---

## 13.8 Key takeaways

- Continuous learning turns **repeated corrections** into **durable, auto-loading knowledge**.
- Prefer **continuous-learning-v2** (instincts + confidence) over the v1 Stop-hook flow.
- Manage instincts with `/instinct-status|import|export|prune|promote`; instincts are **project-scoped** until promoted.
- **`/evolve`** clusters instincts into new skills; **`/skill-create`** mines git history.
- Capture runs on the **Stop hook** to avoid per-prompt latency.

Next: making all of this fast and cheap.

---

[← Cross-Harness Use](12-cross-harness.md) · [Table of Contents](../README.md) · [Next: Token Optimization →](14-token-optimization.md)
