# Project Memory

- **Name:** sdd_template
- **Purpose:** AI coding-agent starter repository that downloads, audits, curates, and syncs AI coding-agent configuration sources.
- **Stack:** Node.js 20+, plain JavaScript (ESM), no runtime dependencies for bootstrap scripts.
- **Supported agents:** Claude Code, Codex, Gemini CLI, Cursor, OpenCode, Grok Build, GitHub Copilot.

## Key conventions
- Source-of-truth manifests live in `sources/`.
- Downloaded repos go to `external/sources/` and are git-ignored and untrusted.
- Shared rules live in `rules/` and are composed into agent configs by `npm run sync`.
- Nothing from downloaded sources is executed or imported automatically.
