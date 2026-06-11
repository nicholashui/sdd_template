# Example: Skill Suggestion Workflow

How a self-generated skill/rule suggestion is handled.

1. A suggestion is written to `suggestions/pending/<name>.md`.
2. `npm run review` surfaces it; it is **not** applied automatically.
3. A human reviews it and moves it to `suggestions/approved/` or
   `suggestions/rejected/`.
4. The decision is recorded in `suggestions/audit-log.md`.
5. Only after approval may it be curated into `rules/`, `skills/`, or `hooks/`.

This enforces the human-approval policy in `rules/60-human-approval.md`.
