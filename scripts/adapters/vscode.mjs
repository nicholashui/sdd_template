// adapters/vscode.mjs
// Generates VS Code configuration. VS Code (with the Copilot extension) loads
// custom instructions referenced from .vscode/settings.json and supports
// prompt files. Instructions point at the generated copilot-instructions file.

export const id = 'vscode';
export const name = 'VS Code (Copilot)';

export function generate() {
  const settings = {
    _generatedBy: 'sdd_template sync',
    _note: 'Managed file. Edit rules/ then run `npm run sync`.',
    'chat.promptFiles': true,
    'github.copilot.chat.codeGeneration.instructions': [
      { file: '.github/copilot-instructions.md' },
    ],
    'github.copilot.chat.testGeneration.instructions': [
      { file: '.github/copilot-instructions.md' },
    ],
    'github.copilot.chat.commitMessageGeneration.instructions': [
      {
        text:
          'Use conventional commit format: <type>: <description>. '
          + 'Keep the subject under 72 characters and explain why, not what.',
      },
    ],
  };

  return [{ path: '.vscode/settings.json', content: `${JSON.stringify(settings, null, 2)}\n` }];
}

export default { id, name, generate };
