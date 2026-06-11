// adapters/opencode.mjs
// Generates OpenCode guidance. OpenCode reads AGENTS.md (written by sync at the
// root); this adapter writes a project-scoped .opencode/instructions.md.

import { withHeader, managedBlock } from '../lib/markers.mjs';

export const id = 'opencode';
export const name = 'OpenCode';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const doc = withHeader(
    `# ${projectName} — OpenCode Instructions\n\n`
    + 'OpenCode also reads the root `AGENTS.md`. This file mirrors the shared rules.\n\n'
    + `${managedBlock(rulesText)}\n`,
  );

  return [{ path: '.opencode/instructions.md', content: doc }];
}

export default { id, name, generate };
