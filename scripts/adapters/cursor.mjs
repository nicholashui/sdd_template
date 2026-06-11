// adapters/cursor.mjs
// Generates a Cursor project rule (.cursor/rules/<project>.mdc).

import { AUTO_HEADER, managedBlock } from '../lib/markers.mjs';

export const id = 'cursor';
export const name = 'Cursor';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  // Cursor .mdc files use YAML frontmatter followed by markdown.
  const frontmatter = [
    '---',
    `description: ${projectName} shared agent rules`,
    'globs:',
    'alwaysApply: true',
    '---',
  ].join('\n');

  const body = `${frontmatter}\n\n${AUTO_HEADER}\n\n# ${projectName} Rules\n\n${managedBlock(rulesText)}\n`;

  return [{ path: `.cursor/rules/${projectName}.mdc`, content: body }];
}

export default { id, name, generate };
