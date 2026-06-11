# Example: Cross-Agent Sync Workflow

Keep every supported agent configured from one source of truth.

1. Edit shared rules in `rules/*.md` (ordered by `rules/manifest.json`).
2. Preview the result:

   ```bash
   npm run sync -- --dry-run
   ```

3. Write the generated files:

   ```bash
   npm run sync
   ```

4. Commit the generated outputs (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, dotfiles).

One edit to `rules/` propagates to Claude Code, Codex, Gemini CLI, Cursor,
OpenCode, Grok Build, and GitHub Copilot.
