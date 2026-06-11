// adapters/claude.mjs
// Generates Claude Code configuration: CLAUDE.md and .claude/settings.json.

import { withHeader, managedBlock } from '../lib/markers.mjs';

export const id = 'claude';
export const name = 'Claude Code';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const claudeMd = withHeader(
    `# ${projectName} — Claude Code Instructions\n\n`
    + `${managedBlock(rulesText)}\n`,
  );

  const settings = {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    _generatedBy: 'sdd_template sync',
    _note: 'Managed file. Edit rules/ then run `npm run sync`.',
    permissions: {
      allow: [],
      deny: [],
    },
    enableAllProjectMcpServers: false,
  };

  return [
    { path: 'CLAUDE.md', content: claudeMd },
    { path: '.claude/settings.json', content: `${JSON.stringify(settings, null, 2)}\n` },
  ];
}

export default { id, name, generate };
