// adapters/trae.mjs
// Generates Trae IDE configuration. Trae applies project rules from
// .trae/rules/project_rules.md.

import { AUTO_HEADER, managedBlock } from '../lib/markers.mjs';

export const id = 'trae';
export const name = 'Trae';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const body = `${AUTO_HEADER}\n\n`
    + `# ${projectName} — Trae Project Rules\n\n`
    + 'Always-applied project rules for Trae. Edit `rules/` then run '
    + '`npm run sync`.\n\n'
    + `${managedBlock(rulesText)}\n`;

  return [{ path: '.trae/rules/project_rules.md', content: body }];
}

export default { id, name, generate };
