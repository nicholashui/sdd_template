# Security

- Downloaded upstream repositories are untrusted until audited.
- Never execute scripts from downloaded sources.
- Never run `npm install`, `curl | bash`, or remote installers from a source repo.
- Never copy third-party code into active agent config without curation and approval.
- Keep secrets out of the repository (`.env`, keys, tokens, certificates).
- Restrict MCP servers to the minimum filesystem and network access required.
- Record provenance (URL, commit, license) for any curated import.
