# Testing

- Run relevant tests after meaningful changes.
- Prefer fast, deterministic tests that do not require network access.
- Use the Node built-in test runner (`node --test`).
- Validate manifests, generated output headers, and lockfile shape.
- If tests cannot be run, explain why explicitly.
- Do not weaken or delete tests to make a change pass.
