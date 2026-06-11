// adapters/codebuddy.mjs
// Generates CodeBuddy (Tencent) configuration. CodeBuddy reads always-on rules
// from .codebuddy/rules/*.md, flattened from the project's shared rules.

import { AUTO_HEADER, managedBlock } from '../lib/markers.mjs';

export const id = 'codebuddy';
export const name = 'CodeBuddy';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const body = `${AUTO_HEADER}\n\n`
    + `# ${projectName} — CodeBuddy Rules\n\n`
    + 'Always-on rules and context for CodeBuddy. Edit `rules/` then run '
    + '`npm run sync`.\n\n'
    + `${managedBlock(rulesText)}\n`;

  return [{ path: `.codebuddy/rules/${projectName}.md`, content: body }];
}

export default { id, name, generate };
