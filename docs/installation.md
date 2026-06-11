# Installation

## Requirements

- **Node.js >= 20** (uses ESM and the built-in test runner).
- **git** on `PATH` (used to clone/update sources).
- Network access to GitHub for `sources:download`.

No third-party npm dependencies are required for the bootstrap scripts.

## Setup

```bash
# from the project root
npm run doctor      # verify environment
npm run bootstrap   # full pipeline
```

`bootstrap` will:

1. Verify the environment.
2. Clone enabled sources into `external/sources/`.
3. Write `sources/source-lock.json`.
4. Generate `docs/source-audit.md`.
5. Run security checks.
6. Preview the agent-config sync.
7. Run tests.

## Offline / restricted networks

If GitHub is unreachable, `sources:download` will fail for required sources.
All local files are still created. Record the blocker in `status.md` and re-run
`npm run sources:download` once connectivity is restored.
