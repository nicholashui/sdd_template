# Usage

## Bootstrap

```bash
npm run bootstrap
```

Runs doctor → sources:download → sources:audit → security → sync (dry-run) → test.

## Manage sources

```bash
npm run sources:download              # clone enabled sources
npm run sources:update                # fetch + fast-forward existing repos
npm run sources:check                 # report status without changing anything
node scripts/source-download.mjs --profile core
node scripts/source-download.mjs --profile official
node scripts/source-download.mjs --profile discovery
node scripts/source-download.mjs --dry-run
node scripts/source-download.mjs --strict
```

Profiles select sources by `tier` (e.g. `core`, `official`, `discovery`) or by
`priority`. `all` selects every enabled source.

## Audit

```bash
npm run sources:audit   # regenerate docs/source-audit.md from manifest + lock
```

## Sync agent configs

```bash
npm run sync -- --dry-run   # preview
npm run sync                # write generated files
```

Generated files are composed from `rules/` and carry an auto-generated header and
managed markers. User content outside the managed markers in `*.md` files is
preserved across runs.

## Create a new project

```bash
npm run create -- --name demo --path ../demo
npm run create -- --name demo --path ../demo --purpose "Example" --stack "Node.js 20+, TypeScript"
npm run create -- --name demo --path ../demo --no-download
npm run create -- --name demo --path ../demo --force
```
