# Example: SDD Feature Workflow

A spec-driven flow for adding a feature.

1. **Specify** — write the requirement and acceptance criteria.
2. **Plan** — break it into an ordered task list (see `skills/planning`).
3. **Implement** — make surgical changes (see `skills/implementation`).
4. **Test** — add/run deterministic tests (`npm run test`).
5. **Review** — self-review against acceptance criteria (`npm run review`).
6. **Sync** — regenerate agent configs if rules changed (`npm run sync`).

The goal stays visible throughout; change only what the spec requires.
