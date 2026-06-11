// adapters/kiro.mjs
// Generates Kiro configuration. Kiro reads always-on "steering" files from
// .kiro/steering/*.md (YAML frontmatter `inclusion: auto`) and MCP servers
// from .kiro/settings/mcp.json.

import { AUTO_HEADER, managedBlock } from '../lib/markers.mjs';

export const id = 'kiro';
export const name = 'Kiro';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  // Steering frontmatter must come first; `inclusion: auto` makes it always-on.
  const frontmatter = [
    '---',
    'inclusion: auto',
    `description: ${projectName} shared agent rules (generated from rules/)`,
    '---',
  ].join('\n');

  const steering = `${frontmatter}\n\n${AUTO_HEADER}\n\n`
    + `# ${projectName} Rules\n\n${managedBlock(rulesText)}\n`;

  const mcp = {
    _generatedBy: 'sdd_template sync',
    _note: 'Managed file. Edit rules/ then run `npm run sync`.',
    mcpServers: {},
  };

  return [
    { path: `.kiro/steering/${projectName}.md`, content: steering },
    { path: '.kiro/settings/mcp.json', content: `${JSON.stringify(mcp, null, 2)}\n` },
  ];
}

export default { id, name, generate };
