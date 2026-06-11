// adapters/gemini.mjs
// Generates Gemini CLI configuration: GEMINI.md and .gemini/settings.json.

import { withHeader, managedBlock } from '../lib/markers.mjs';

export const id = 'gemini';
export const name = 'Gemini CLI';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const geminiMd = withHeader(
    `# ${projectName} — Gemini CLI Instructions\n\n`
    + `${managedBlock(rulesText)}\n`,
  );

  const settings = {
    _generatedBy: 'sdd_template sync',
    _note: 'Managed file. Edit rules/ then run `npm run sync`.',
    contextFileName: 'GEMINI.md',
    mcpServers: {},
  };

  return [
    { path: 'GEMINI.md', content: geminiMd },
    { path: '.gemini/settings.json', content: `${JSON.stringify(settings, null, 2)}\n` },
  ];
}

export default { id, name, generate };
