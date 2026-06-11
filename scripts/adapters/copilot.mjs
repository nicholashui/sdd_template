// adapters/copilot.mjs
// Generates GitHub Copilot custom instructions (.github/copilot-instructions.md).

import { withHeader, managedBlock } from '../lib/markers.mjs';

export const id = 'copilot';
export const name = 'GitHub Copilot';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const doc = withHeader(
    `# ${projectName} — GitHub Copilot Instructions\n\n`
    + 'These instructions guide GitHub Copilot and the Copilot coding agent.\n\n'
    + `${managedBlock(rulesText)}\n`,
  );

  return [{ path: '.github/copilot-instructions.md', content: doc }];
}

export default { id, name, generate };
