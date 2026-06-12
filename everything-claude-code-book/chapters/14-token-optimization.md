# Chapter 14 — Token Optimization & Performance

[← Continuous Learning](13-continuous-learning.md) · [Table of Contents](../README.md) · [Next: Security →](15-security.md)

---

Agentic coding can get expensive fast, and quality *degrades* as you fill the context window. ECC treats cost and context as engineering problems with real levers. This chapter collects them.

## 14.1 The settings that move the needle

Add to `~/.claude/settings.json`:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

| Setting | Default | Recommended | Why |
|---------|---------|-------------|-----|
| `model` | opus | **sonnet** | ~60% cost cut; handles 80%+ of coding tasks |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | ~70% less hidden "thinking" cost per request |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | Compacts earlier → better quality in long sessions |
| `ECC_CONTEXT_MONITOR_COST_WARNINGS` | on | **off** for subscription users | Hides API-rate estimates, keeps context/scope/loop warnings |

Switch up only when you need depth: `/model opus`.

---

## 14.2 Model routing: match the model to the task

The single biggest cost lever is **not using Opus for everything**. ECC's recommended routing (longform guide):

| Task | Model | Why |
|------|-------|-----|
| Exploration / search | **Haiku** | Fast, cheap, fine for finding files |
| Simple single-file edits | **Haiku** | Clear instructions, low risk |
| Multi-file implementation | **Sonnet** | Best balance for coding |
| PR reviews | **Sonnet** | Catches nuance affordably |
| Complex architecture | **Opus** | Deep reasoning |
| Security analysis | **Opus** | Can't afford to miss things |
| Debugging hard bugs | **Opus** | Must hold the whole system in mind |
| Writing docs | **Haiku** | Structure is simple |

> **Default to Sonnet for ~90% of coding.** Escalate to Opus only when the first attempt failed, the task spans 5+ files, it's an architectural decision, or it's security-critical.

This is also why **sub-agents** matter so much (Chapter 5): a sub-agent architecture lets you assign the *cheapest model sufficient for each sub-task* instead of paying Opus rates for a file search. ECC's `/model-route` command and `harness-optimizer` agent help automate this.

---

## 14.3 Protect the context window

Quality falls off a cliff near the context limit. Guard it:

- **Avoid the last ~20%** of the window for large refactors and multi-file features. Single edits/docs tolerate higher utilization.
- **Keep MCPs lean** — <10 servers / <80 tools enabled (Chapter 10). This alone can reclaim 100k+ tokens.
- **Cap SessionStart context** — `ECC_SESSION_START_MAX_CHARS=4000`, or `ECC_SESSION_START_CONTEXT=off` for local/low-context models.
- **Strategic compaction** — disable auto-compact; compact at logical breaks (`/compact` or the `strategic-compact` skill). ECC's `suggest-compact` hook nudges you; `PreCompact` saves state first.
- **Use `/context-budget`** to see where tokens are going and trim overhead.
- **Lean on the context monitor** — the `post:ecc-context-monitor` hook warns about exhaustion, runaway cost, scope creep, and tool loops.

---

## 14.4 Tool-level token savings

- **`mgrep` over `grep`/ripgrep** — in ECC's 50-task benchmark, mgrep + Claude Code used roughly **2× fewer tokens** at similar/better judged quality. Install via plugin marketplace; use the `/mgrep` skill (local and web search).
- **Modular codebases** — files in the hundreds of lines, not thousands. Cheaper to read, and tasks succeed on the first try more often. (Also a *rule*.)
- **CLI-wrapped-in-a-skill** instead of always-on MCP (Chapter 10) — keeps tool descriptions out of context.
- **Codemaps** — let skills carry lightweight maps so the assistant navigates without re-exploring.

---

## 14.5 Parallelization (covered in Ch. 11, summarized)

Parallel work multiplies throughput — but ECC advises *minimum viable* parallelization:
- **`/fork`** for non-overlapping read-only work (questions/research) while the main chat edits code.
- **Git worktrees** for overlapping code work — one instance per checkout; `/rename` your chats.
- **The cascade method** — focus on 3–4 tasks max, oldest→newest.

The guidance against "run 10 terminals because you can": every extra instance is context you have to manage. Add one only out of necessity.

---

## 14.6 Verification efficiency

Re-doing work because you didn't verify is its own cost. ECC's eval framing:
- **Checkpoint evals** at logical milestones; **continuous evals** after major changes.
- **pass@k** when you just need it to work; **pass^k** when you need consistency.

`eval-harness` and `verification-loop` skills, plus `/quality-gate`, implement this. Catching a regression early is far cheaper than after it ships.

---

## 14.7 Cost visibility

```text
/cost-report      # cost summary
/context-budget   # token overhead analysis
```
And `npm run dashboard` / `ecc status` surface metrics so cost isn't a mystery. The metrics-bridge hook keeps a running session aggregate for the status line and context monitor.

---

## 14.8 A "fast and cheap" starter config

If you want a single recommendation to begin with:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```
```bash
export ECC_HOOK_PROFILE=standard
export ECC_SESSION_START_MAX_CHARS=4000
# keep < 10 MCPs and < 80 tools enabled per project
# default to Sonnet; /model opus only when truly needed
# use mgrep; keep files modular; compact at logical breaks
```

---

## 14.9 Key takeaways

- Set **`model: sonnet`**, **`MAX_THINKING_TOKENS: 10000`**, **autocompact 50%** for big cost cuts.
- **Route models by task**: Haiku (search) · Sonnet (default) · Opus (hard/critical only).
- **Protect context**: <10 MCPs / <80 tools, cap SessionStart, compact strategically, watch `/context-budget`.
- **`mgrep`** and **modular files** cut token usage materially.
- Parallelize **minimally**; verify **early** (checkpoint/continuous, pass@k vs pass^k).

Next — the chapter to read before you let anything run autonomously: **security.**

---

[← Continuous Learning](13-continuous-learning.md) · [Table of Contents](../README.md) · [Next: Security →](15-security.md)
