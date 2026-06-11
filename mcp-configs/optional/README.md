# mcp-configs/optional/

Optional MCP server configurations that are **disabled by default**.

Before enabling any optional MCP server:

1. Review the server's required filesystem and network scope.
2. Prefer the narrowest access that works.
3. Obtain human approval (see `rules/60-human-approval.md`).
4. Add credentials via environment variables, never committed to the repo.

Example servers worth considering (reference only — not enabled here):

- GitHub MCP server (issues, PRs, code search).
- Filesystem MCP server (scope to a specific subdirectory).
