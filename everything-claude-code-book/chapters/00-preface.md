# Chapter 0 — Preface & Quick Start

[← Back to Table of Contents](../README.md) · [Next: Background & Philosophy →](01-background-and-philosophy.md)

---

## The two-minute version

You use an AI coding assistant — Claude Code, Cursor, Codex, OpenCode, something. Out of the box it is a smart but *forgetful* generalist. It re-explores your codebase every session, forgets the conventions you taught it yesterday, happily commits a `console.log`, and occasionally does something risky because nothing stopped it.

**Everything Claude Code (ECC)** is a single, reusable layer you drop in front of that assistant to fix all of that at once. It gives the assistant:

- **Specialists to delegate to** (64 *agents*: planner, code-reviewer, security-reviewer, build-error-resolver, …).
- **Repeatable workflows** (262 *skills*: test-driven development, security review, API design, …).
- **Automatic guardrails** (*hooks* that format your code, scan for secrets, and save your context).
- **Always-on standards** (*rules*: immutability, 80% test coverage, conventional commits, no hardcoded secrets).
- **Memory** that survives between sessions, and a **learning loop** that turns repeated patterns into new skills.
- **Security**: sandboxing guidance and a built-in scanner (AgentShield).

And it does this **across many tools** — author it once, ECC translates it into the native config format of each harness.

<p align="center">
  <img src="../assets/svg/01-what-is-ecc.svg" alt="ECC is one operator layer between you and every AI coding tool" width="760">
</p>

If you remember one sentence from this whole book, make it this one:

> **ECC turns a clever-but-generic AI assistant into a disciplined senior engineer with a team of specialists, a memory, and a security guard.**

---

## What "ECC" is *not*

- It is **not** elliptic curve cryptography. The short repo name `affaan-m/ecc` redirects to `affaan-m/everything-Claude-code`.
- It is **not** a model or an API. It runs *on top of* the AI tool you already use.
- It is **not** locked to Claude. Despite the name, it supports Cursor, Codex, OpenCode, Gemini, Zed, GitHub Copilot, and more.

---

## Try it in under five minutes (Claude Code)

> Full installation, alternatives, and other harnesses are covered in [Chapter 3](03-installation.md). This is the fastest happy path.

**1. Add the marketplace and install the plugin** (inside Claude Code):

```text
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc
```

**2. Add the rules you care about** (plugins can't ship rules, so copy them manually):

```bash
git clone https://github.com/affaan-m/ECC.git
cd ECC
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/
cp -r rules/typescript ~/.claude/rules/ecc/   # pick your stack
```

**3. Use it:**

```text
/ecc:plan "Add user authentication with OAuth"
```

That's the whole loop: you describe intent, ECC plans it, delegates to the right specialists, enforces tests and standards, and remembers what happened.

Not sure what to install? Ask the bundled advisor from any project:

```bash
npx ecc consult "security reviews" --target claude
```

---

## The golden rule of installing ECC

There are two install paths (plugin and manual installer). **Pick exactly one.** The single most common broken setup is stacking them — installing the plugin *and then* running the full installer — which duplicates skills and hooks. We will hammer this point again in Chapter 3, but internalize it now.

---

## How the rest of the book flows

```text
Part I    Orientation        →  what & why            (Ch 0–2)
Part II   Getting it running  →  install & concepts    (Ch 3–4)
Part III  The building blocks →  agents…MCP            (Ch 5–10)
Part IV   Operating ECC       →  daily workflows       (Ch 11–14)
Part V    Safety & advanced   →  security, ECC 2.0     (Ch 15–17)
Part VI   Reference           →  troubleshooting, glossary (Ch 18–19)
```

Turn the page to understand *why* ECC exists and the philosophy that shaped every file in it.

---

[← Back to Table of Contents](../README.md) · [Next: Background & Philosophy →](01-background-and-philosophy.md)
