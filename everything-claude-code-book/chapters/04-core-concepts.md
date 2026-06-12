# Chapter 4 — Core Concepts: The Six Building Blocks

[← Installation](03-installation.md) · [Table of Contents](../README.md) · [Next: Agents →](05-agents.md)

---

Everything in ECC is made of six kinds of things. Learn these six and the whole system snaps into focus. This chapter is the map; Chapters 5–10 zoom into each one.

<p align="center">
  <img src="../assets/svg/03-six-components.svg" alt="The six building blocks of ECC" width="800">
</p>

---

## 4.1 The six at a glance

| Block | One-liner | Lives in | You interact by |
|-------|-----------|----------|-----------------|
| **Agents** | Scoped specialists you delegate to | `agents/<name>.md` | The orchestrator delegates; you can request one |
| **Skills** ★ | Reusable, multi-step workflows + knowledge | `skills/<name>/SKILL.md` | Invoke, auto-suggest, or agents reuse them |
| **Commands** | Slash entries that trigger a workflow | `commands/<name>.md` | You type `/name` |
| **Hooks** | Event-triggered automations | `hooks/hooks.json` → `scripts/hooks/*.js` | Nothing — they fire automatically |
| **Rules** | Always-follow guidelines | `rules/common/` + per-language | Loaded into context every session |
| **MCP configs** | Connectors to external services | `mcp-configs/mcp-servers.json` | Enable per project; the model calls tools |

★ Skills are the **canonical** surface. When in doubt, think in skills.

---

## 4.2 How they relate

A useful way to hold all six in your head:

- **Rules** are the *constitution* — passive, always present, constrain everything.
- **Skills** are the *playbooks* — the durable "how we do X here."
- **Commands** are *shortcuts* — convenient typed triggers, increasingly thin wrappers over skills.
- **Agents** are the *team* — specialists the orchestrator hands work to, often using skills.
- **Hooks** are the *reflexes* — they fire on events without anyone asking.
- **MCP** is the *phone line* — how the model reaches GitHub, a database, a browser.

A single feature request might touch all six: a **command** kicks off a **skill**, which delegates to an **agent**, all **constrained by rules**, with **hooks** firing on every edit, and an **MCP** server fetching data. That choreography *is* ECC.

---

## 4.3 Skills vs. Commands vs. Hooks — the three "active" surfaces

These three are the ones people confuse most, because all three can "do a workflow." The difference is the **trigger** and the **durability**.

<p align="center">
  <img src="../assets/svg/05-surfaces.svg" alt="Comparison of skills, commands, and hooks" width="800">
</p>

- A **skill** is invoked (by you or automatically) and is *the durable unit*. New logic belongs here.
- A **command** is something *you type* (`/plan`). ECC keeps commands for compatibility but is migrating their logic into skills.
- A **hook** is *triggered by an event* (a file edit, session start) — you never type it.

> **Rule of thumb:** "Should this run *every time* X happens, no matter what?" → **hook**. "Is this a *workflow I choose to run*?" → **skill** (with an optional `/command` shortcut).

---

## 4.4 Two cross-cutting capabilities

On top of the six blocks, two capabilities tie everything together. They get their own chapters because they are what make ECC feel *alive* rather than static:

- **Memory** (Chapter 9): hooks save your session state and reload it next time, so the assistant doesn't start from zero each day.
- **Continuous learning** (Chapter 13): repeated patterns become *instincts*, which `/evolve` clusters into brand-new skills. The catalog grows from your own usage.

---

## 4.5 The frontmatter convention

Agents and skills are just Markdown files with a YAML header (frontmatter). The header tells the harness how to treat the file. You'll see this pattern constantly:

```markdown
---
name: code-reviewer
description: When to use this. Be specific — this drives auto-selection.
tools: ["Read", "Grep", "Glob", "Bash"]   # agents only
model: sonnet                              # agents only
origin: ECC                                # skills only
---

The body: the actual instructions / workflow.
```

The `description` field is doing heavy lifting: it's how the harness decides *when* to surface this agent or skill. Vague descriptions get ignored; precise ones get used.

---

## 4.6 Key takeaways

- ECC is six blocks: **Agents, Skills, Commands, Hooks, Rules, MCP configs.**
- **Skills are canonical**; commands are increasingly thin shortcuts; hooks are automatic.
- Rules constrain; agents execute; MCP connects; memory + learning make it improve over time.
- Agents and skills are Markdown + YAML frontmatter; the `description` drives auto-selection.

Let's start with the team you delegate to: **agents.**

---

[← Installation](03-installation.md) · [Table of Contents](../README.md) · [Next: Agents →](05-agents.md)
