// adapters/zed.mjs
// Generates Zed editor configuration. Zed's agent reads tool-permission policy
// from .zed/settings.json. This mirrors a safe default that confirms risky
// shell/file actions and denies obvious secret/dangerous patterns. Zed also
// reads repository instructions from AGENTS.md (written at the root by sync).

export const id = 'zed';
export const name = 'Zed';

export function generate() {
  const settings = {
    _generatedBy: 'sdd_template sync',
    _note: 'Managed file. Edit rules/ then run `npm run sync`.',
    agent: {
      tool_permissions: {
        default: 'confirm',
        tools: {
          terminal: {
            default: 'confirm',
            always_deny: [
              { pattern: 'rm\\s+-rf\\s+(/|~)' },
              { pattern: '(^|\\s)(cat|sed|grep|rg)\\s+.*\\.(env|pem|key)(\\s|$)' },
            ],
            always_confirm: [
              { pattern: 'sudo\\s' },
              { pattern: '(npm|pnpm|yarn|bun)\\s+(install|add|dlx|exec|x)\\b' },
            ],
          },
          edit_file: {
            always_deny: [
              { pattern: '\\.env' },
              { pattern: '\\.(pem|key|p12|pfx)$' },
            ],
          },
        },
      },
    },
  };

  return [{ path: '.zed/settings.json', content: `${JSON.stringify(settings, null, 2)}\n` }];
}

export default { id, name, generate };
