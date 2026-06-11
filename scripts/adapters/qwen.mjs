// adapters/qwen.mjs
// Generates Qwen Code configuration. Qwen Code (a Gemini CLI fork) loads its
// project context from QWEN.md at the repository root.

import { withHeader, managedBlock } from '../lib/markers.mjs';

export const id = 'qwen';
export const name = 'Qwen Code';

export function generate(ctx) {
  const { projectName, rulesText } = ctx;

  const qwenMd = withHeader(
    `# ${projectName} — Qwen Code Instructions\n\n`
    + 'Qwen Code reads this file (`QWEN.md`) as project context. It mirrors the '
    + 'shared rules.\n\n'
    + `${managedBlock(rulesText)}\n`,
  );

  return [{ path: 'QWEN.md', content: qwenMd }];
}

export default { id, name, generate };
