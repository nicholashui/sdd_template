// adapters/grok-build.mjs
// Generates xAI Grok Build guidance (.grok/instructions.md). Grok Build also
// supports AGENTS.md-style repository instructions written by sync at the root.

import { withHeader, managedBlock } from '../lib/markers.mjs';

export const id = 'grok-build';
export const name = 'xAI Grok Build';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const doc = withHeader(
    `# ${projectName} — Grok Build Instructions\n\n`
    + 'Grok Build also reads the root `AGENTS.md`. This file mirrors the shared rules.\n\n'
    + `${managedBlock(rulesText)}\n`,
  );

  return [{ path: '.grok/instructions.md', content: doc }];
}

export default { id, name, generate };
