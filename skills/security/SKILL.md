# Skill: Security

Run static safety checks; never execute untrusted code.

## Checks
- Scan downloaded sources for install hooks and remote pipe-to-shell patterns.
- Detect committed secrets in first-party directories.
- Flag MCP configs that grant broad filesystem/network access.
- Record provenance for any curated import.

Implemented by `scripts/security.mjs` (`npm run security`).
