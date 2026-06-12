# Chapter 10 — MCP & Context Management

[← Rules & Memory](09-rules-and-memory.md) · [Table of Contents](../README.md) · [Next: Everyday Workflows →](11-everyday-workflows.md)

---

## 10.1 What MCP is

**MCP** (Model Context Protocol) is a standard way to connect your assistant to external services — GitHub, a database, a deployment platform, a browser. An MCP server exposes *tools* the model can call directly. Instead of you copy-pasting a SQL result into chat, the model queries the database itself.

The shortform guide frames it well: an MCP is *"a prompt-driven wrapper around"* an API — not a replacement for the API, but a flexible way for the model to navigate it. Example: the Supabase MCP lets the assistant list tables and run SQL upstream without leaving the session.

ECC keeps MCP configs in `mcp-configs/mcp-servers.json` and ships exactly **one default connector**: `chrome-devtools` (browser control). Everything else is opt-in — either a skill that wraps a CLI/REST API, or a catalog entry you enable deliberately. This is a *policy*, documented in `docs/MCP-CONNECTOR-POLICY.md`, and it exists to protect the thing this chapter is really about: your **context window**.

---

## 10.2 The context-window problem (read this twice)

Here is the most important operational lesson in all of ECC, and it surprises almost everyone:

> **Every MCP tool description consumes tokens from your context window — before you've done any work.** Too many enabled MCPs can shrink a 200k window down to ~70k, and quality degrades hard as you approach the limit.

Each enabled MCP server advertises its tools, and every tool's description sits in context permanently. Enable a dozen chatty MCP servers and you've spent a third of your window on menus you may never use.

### The rule of thumb
From the guides:
- Keep **fewer than 10 MCP servers enabled**.
- Keep **fewer than 80 tools active**.
- It's fine to have 20–30 MCPs *configured* — just **disable the ones you're not using per project**.

```bash
# See what's enabled
/mcp

# Disable unused ones (Claude Code persists this to ~/.claude.json)
```

> Note: `/mcp` is the reliable live toggle. Editing `.claude/settings.json` is **not** a dependable way to turn off already-loaded MCP servers — use `/mcp`.

---

## 10.3 The CLI-instead-of-MCP trick

The longform guide shares a sharp optimization: **many MCPs are replaceable.** Version control (GitHub), databases (Supabase), and deployment (Vercel, Railway) already have excellent **CLIs** that the MCP is essentially wrapping. So instead of loading the GitHub MCP at all times:

- Build a **skill or command** that wraps the CLI you need (e.g. a `/gh-pr` that runs `gh pr create` with your preferred flags).
- You get the convenience without the always-on context cost.

This doesn't reduce *token usage* the way it reduces *context pressure* — but with lazy loading, the context-window problem is largely solved. CLI-via-skills is the recommended default for anything with a good CLI; reserve MCP for services where the tool-call ergonomics genuinely help.

---

## 10.4 Configuring MCP in ECC

Because plugin installs don't auto-enable bundled MCPs, you opt in:

**Live, in Claude Code:**
```text
/mcp           # add / enable / disable servers; persisted to ~/.claude.json
```

**Repo-local:** copy the servers you want from `mcp-configs/mcp-servers.json` into a project `.mcp.json`, and replace any `YOUR_*_HERE` placeholders with real keys.

**If you already run your own copies of ECC-bundled MCPs:**
```bash
export ECC_DISABLED_MCPS="chrome-devtools"
```
ECC install/sync flows will then skip/remove those bundled servers rather than re-adding duplicates. (`ECC_DISABLED_MCPS` is an install/sync filter, not a live Claude toggle.)

A representative set of MCP servers ECC knows about (you'd enable a handful per project): GitHub, Supabase, Context7 (live docs), Exa (neural search), Memory, Playwright, Sequential Thinking, Vercel, Railway, Cloudflare, ClickHouse, Firecrawl, plus the default `chrome-devtools`.

---

## 10.5 Other context-saving tools

Context discipline isn't only about MCP. ECC and the guides recommend several habits:

- **`mgrep` instead of `grep`/ripgrep** — a semantic search that, in ECC's 50-task benchmark, used roughly **2× fewer tokens** at similar or better quality. Install via plugin marketplace and use the `/mgrep` skill.
- **Modular codebases** — files in the hundreds of lines rather than thousands. Smaller files = cheaper reads and better first-try success. (This is also a *rule*.)
- **Strategic compaction** — disable auto-compact and compact at logical intervals (`/compact`, or the `strategic-compact` skill). ECC's `suggest-compact` hook nudges you at good moments, and `PreCompact` saves state first.
- **The context monitor** — the `post:ecc-context-monitor` hook warns you about context exhaustion, runaway cost, scope creep, and tool loops before they bite.
- **`/context-budget`** — analyze where your tokens are going and trim overhead.

The SessionStart context injection is itself capped (default 8000 chars) and tunable via `ECC_SESSION_START_MAX_CHARS` or `ECC_SESSION_START_CONTEXT=off` for low-context setups.

---

## 10.6 Plugins (a close cousin of MCP)

Plugins package tools for easy install — a plugin can bundle skills, hooks, MCP servers, or LSP integrations. The same context warning applies: enabling many plugins (and their MCPs/tools) eats your window. The author keeps ~14 plugins installed but only **4–5 enabled at a time**.

Particularly useful plugin types:
- **LSP plugins** (`typescript-lsp`, `pyright-lsp`) — real-time type-checking and go-to-definition when you run the assistant outside an IDE.
- **`hookify`** — create hooks conversationally.
- **`mgrep`** — better search.
- **`context7`** — live documentation.

---

## 10.7 Key takeaways

- **MCP** connects the model to external services as callable tools; ECC ships only `chrome-devtools` by default.
- **Every enabled MCP costs context tokens up front** — keep **<10 servers / <80 tools** enabled; configure many, enable few.
- Use **`/mcp`** as the live toggle (not `settings.json`).
- Prefer **CLI-wrapped-in-a-skill** over always-on MCP for services with good CLIs.
- Protect context with **`mgrep`, modular files, strategic compaction, the context monitor, and `/context-budget`.**

Now we put all of this together into the workflows you'll actually run every day.

---

[← Rules & Memory](09-rules-and-memory.md) · [Table of Contents](../README.md) · [Next: Everyday Workflows →](11-everyday-workflows.md)
