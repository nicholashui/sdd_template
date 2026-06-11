// knowledge.mjs
// Pure helpers for the shared knowledge base.
//
// The knowledge base is a curated, audited corpus of skills, agents, and
// commands vendored under knowledge/ so every supported coding agent works from
// the same playbook. This module contains only pure functions (no filesystem
// side effects beyond reading) so it is easy to unit test.

import { exists, readJson } from './fs-safe.mjs';

export const KNOWLEDGE_ROOT = 'knowledge';
export const KNOWLEDGE_MANIFEST_PATH = 'knowledge/manifest.json';

// Only text-like content is ever imported into the repository. Executables,
// binaries, and credential-shaped files are skipped so nothing dangerous is
// committed and the static security gate stays green.
export const ALLOWED_EXTENSIONS = new Set([
  '.md',
  '.mdc',
  '.markdown',
  '.txt',
  '.rst',
  '.json',
  '.yaml',
  '.yml',
  '.toml',
  '.csv',
]);

// Mirror of the secret-file patterns enforced by scripts/security.mjs. Any file
// whose basename matches these is never imported.
const SECRET_FILE_PATTERNS = [
  /^\.env(\..+)?$/i,
  /\.pem$/i,
  /\.key$/i,
  /\.pfx$/i,
  /\.p12$/i,
  /id_rsa$/i,
  /id_ed25519$/i,
];

/** True if a basename looks like a committed secret/credential file. */
export function isSecretLike(name) {
  return SECRET_FILE_PATTERNS.some((re) => re.test(name));
}

/** True if a file is safe text content that may be imported. */
export function isAllowedFile(name) {
  if (isSecretLike(name)) return false;
  const dot = name.lastIndexOf('.');
  if (dot === -1) return false;
  const ext = name.slice(dot).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

/**
 * Parse a leading YAML-ish frontmatter block.
 * Only top-level `key: value` scalars are captured; nested/array lines are
 * ignored (they are not needed for the catalog).
 * @param {string} text
 * @returns {{ data: Record<string,string>, body: string }}
 */
export function parseFrontmatter(text) {
  if (typeof text !== 'string' || !text.startsWith('---')) {
    return { data: {}, body: text || '' };
  }
  // Find the closing fence: a line that is exactly '---'.
  const close = text.indexOf('\n---', 3);
  if (close === -1) return { data: {}, body: text };

  const fmRaw = text.slice(3, close).replace(/^\r?\n/, '');
  let body = text.slice(close + 4);
  body = body.replace(/^[^\n]*\r?\n/, ''); // drop the remainder of the closing fence line
  body = body.replace(/^\r?\n/, '');

  const data = {};
  for (const rawLine of fmRaw.split('\n')) {
    if (/^\s/.test(rawLine)) continue; // skip indented (nested/array) lines
    const line = rawLine.replace(/\r$/, '');
    if (!line.trim() || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z0-9_.-]+):\s?(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"'))
      || (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }
  return { data, body };
}

/** Collapse whitespace and clip a description to a single readable line. */
export function oneLine(text, max = 240) {
  if (!text) return '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

/** Load the committed knowledge manifest, or null when not yet imported. */
export function loadKnowledgeManifest(p = KNOWLEDGE_MANIFEST_PATH) {
  if (!exists(p)) return null;
  try {
    return readJson(p);
  } catch {
    return null;
  }
}

/**
 * Build the concise "Knowledge Base" section injected into every agent's
 * instruction file. Returns an empty string when nothing has been imported.
 */
export function buildKnowledgeSection(manifest) {
  if (!manifest || !manifest.counts) return '';
  const { skills = 0, agents = 0, commands = 0 } = manifest.counts;
  if (skills + agents + commands === 0) return '';

  const src = manifest.source || {};
  const sourceLabel = src.id ? `${src.id} (${src.repo || 'upstream'})` : 'upstream sources';
  const lic = src.license ? `${src.license}` : 'see knowledge/NOTICE.md';

  const lines = [];
  lines.push('# Knowledge Base (shared across all coding agents)');
  lines.push('');
  lines.push(
    'This project vendors a curated, audited knowledge corpus under `knowledge/` '
    + 'so every supported coding agent works from the same playbook. The files are '
    + 'plain Markdown — readable and usable by any agent operating in this repo.',
  );
  lines.push('');
  lines.push(`- **Skills** (${skills}) — \`knowledge/skills/<name>/SKILL.md\``);
  lines.push(`- **Agents** (${agents}) — \`knowledge/agents/<name>.md\``);
  lines.push(`- **Commands** (${commands}) — \`knowledge/commands/<name>.md\``);
  lines.push('- **Full catalog** — `knowledge/INDEX.md`');
  lines.push(`- **Provenance & license** — \`knowledge/NOTICE.md\` (source: ${sourceLabel}, ${lic})`);
  lines.push('');
  lines.push('## How to use this knowledge');
  lines.push('');
  lines.push(
    '1. When a task matches a skill\'s trigger (see its `description`), open that '
    + 'skill\'s `SKILL.md` and follow it.',
  );
  lines.push(
    '2. For domain work, adopt the most relevant **agent** persona from '
    + '`knowledge/agents/` (e.g. `security-reviewer`, `code-reviewer`, `architect`).',
  );
  lines.push(
    '3. Treat **commands** in `knowledge/commands/` as repeatable playbooks for '
    + 'common workflows (review, build-fix, planning, testing).',
  );
  lines.push(
    '4. Browse `knowledge/INDEX.md` for the complete, categorized list. This '
    + 'corpus is reference guidance, not auto-executed code.',
  );
  return lines.join('\n');
}

function bulletList(items) {
  if (!items || items.length === 0) return '_None._\n';
  return `${items
    .map((it) => {
      const desc = oneLine(it.description);
      const label = desc ? ` — ${desc}` : '';
      // INDEX.md lives inside knowledge/, so links are relative to it.
      const rel = String(it.path).replace(/^knowledge\//, '');
      return `- [\`${it.name}\`](${rel})${label}`;
    })
    .join('\n')}\n`;
}

/**
 * Build the full INDEX.md body (without the auto-generated header — the caller
 * prepends it).
 */
export function buildIndexMarkdown(manifest) {
  const skills = (manifest.skills || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const agents = (manifest.agents || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const commands = (manifest.commands || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const src = manifest.source || {};

  const parts = [];
  parts.push('# Knowledge Base Index');
  parts.push('');
  parts.push(
    'Curated, audited corpus shared across every supported coding agent. '
    + 'Generated by `npm run knowledge:index` — do not edit by hand.',
  );
  parts.push('');
  parts.push(
    `**Source:** ${src.repo || src.id || 'upstream'}`
    + `${src.commit ? ` @ \`${String(src.commit).slice(0, 10)}\`` : ''}`
    + `${src.license ? ` · ${src.license}` : ''} · see [NOTICE.md](NOTICE.md)`,
  );
  parts.push('');
  parts.push(
    `**Totals:** ${skills.length} skills · ${agents.length} agents · ${commands.length} commands`,
  );
  parts.push('');
  parts.push(`## Skills (${skills.length})`);
  parts.push('');
  parts.push(bulletList(skills));
  parts.push(`## Agents (${agents.length})`);
  parts.push('');
  parts.push(bulletList(agents));
  parts.push(`## Commands (${commands.length})`);
  parts.push('');
  parts.push(bulletList(commands));
  return parts.join('\n');
}

export default {
  KNOWLEDGE_ROOT,
  KNOWLEDGE_MANIFEST_PATH,
  ALLOWED_EXTENSIONS,
  isSecretLike,
  isAllowedFile,
  parseFrontmatter,
  oneLine,
  loadKnowledgeManifest,
  buildKnowledgeSection,
  buildIndexMarkdown,
};
