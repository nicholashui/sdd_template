# Skill: Lifecycle

Operate the bootstrap and sync lifecycle.

## Commands
- `npm run bootstrap` — full pipeline (doctor → download → audit → security → sync dry-run → test).
- `npm run sources:update` — refresh downloaded sources.
- `npm run sync` — regenerate agent-config files from `rules/`.
- `npm run review` — list pending suggestions awaiting approval.
