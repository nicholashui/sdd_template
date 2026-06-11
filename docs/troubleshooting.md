# Troubleshooting

## `git is not available; cannot download sources`

Install git and ensure it is on `PATH`. Verify with `git --version`.

## A required source fails to clone

`sources:download` exits non-zero when a `required` source fails. Check:

- network access to GitHub,
- whether the repository moved or was renamed (the downloader records the
  resolved URL and a redirect warning in `sources/source-lock.json`),
- whether the repository still exists.

Optional sources (`"priority": "optional"`) do not fail the run unless `--strict`
is passed; their failures are still recorded in the lockfile and audit.

## `target exists but is not a git repository`

A path under `external/sources/` exists but has no `.git`. Remove the directory
and re-run `npm run sources:download`.

## Bootstrap fails at the `test` step

Run `npm run test` directly to see the failing assertion. Tests are deterministic
and do not require network access.

## Generated files keep getting overwritten

Generated files are reproduced by `npm run sync`. Put custom content **outside**
the `BEGIN/END MANAGED AGENT RULES` markers in markdown files so it is preserved.

## Network blocked

If GitHub is unreachable, local files are still created. Record the blocker in
`status.md` and re-run `npm run sources:download` later.
