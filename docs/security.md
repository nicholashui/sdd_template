# Security

## Principles

- **Downloaded sources are untrusted.** They live in `external/sources/`, are
  git-ignored, and are never executed.
- **No remote code execution.** The downloader only clones/updates and reads git
  metadata. It never runs install scripts, `npm install`, `curl | bash`, or hooks
  from downloaded repos.
- **No silent imports.** Nothing from a downloaded source is copied into active
  agent config automatically. Curated imports require license verification,
  recorded provenance, and human approval.
- **Writes stay in-repo.** `scripts/lib/fs-safe.mjs` refuses to write outside the
  project root.

## Static scanner

`npm run security` (`scripts/security.mjs`) performs static checks only:

1. Flags `preinstall`/`install`/`postinstall` scripts in downloaded sources.
2. Flags root-level shell scripts containing remote pipe-to-shell patterns
   (`curl | bash`, `irm | iex`).
3. Detects committed secrets (`.env`, `*.pem`, `*.key`, private keys) in
   first-party directories.
4. Flags MCP configs that appear to grant broad filesystem access.

Critical findings (e.g. committed secrets) fail the check; advisory findings are
reported as warnings.

## Human approval

See `rules/60-human-approval.md`. Approval is required before installing global
packages, running remote installers, enabling credentialed MCP servers, importing
third-party code, modifying hooks, deleting files, or applying self-generated
rule/skill changes.
