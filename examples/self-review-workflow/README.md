# Example: Self-Review Workflow

Use before handing off a change.

1. Run `npm run review` to list pending suggestions.
2. Walk the `skills/review` checklist:
   - Does the change satisfy acceptance criteria?
   - Are edits surgical and unrelated changes avoided?
   - Were relevant tests run?
   - Any security/approval concerns (`rules/30`, `rules/60`)?
3. Save the review under `reviews/YYYY-MM-DD-<topic>.md`.

Reviews are advisory and never modify code automatically.
