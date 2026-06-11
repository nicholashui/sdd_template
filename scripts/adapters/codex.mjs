// adapters/codex.mjs
// Generates Codex CLI guidance. Codex reads AGENTS.md at the repo root (written
// by sync directly); this adapter writes a project-scoped .codex/instructions.md.

import { withHeader, managedBlock } from '../lib/markers.mjs';

export const id = 'codex';
export const name = 'OpenAI Codex CLI';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const doc = withHeader(
    `# ${projectName} — Codex Instructions\n\n`
    + 'Codex also reads the root `AGENTS.md`. This file mirrors the shared rules.\n\n'
    + `${managedBlock(rulesText)}\n`,
  );

  return [{ path: '.codex/instructions.md', content: doc }];
}

export default { id, name, generate };
