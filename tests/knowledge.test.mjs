// knowledge.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseFrontmatter,
  oneLine,
  isAllowedFile,
  isSecretLike,
  buildKnowledgeSection,
  buildIndexMarkdown,
  loadKnowledgeManifest,
} from '../scripts/lib/knowledge.mjs';

test('parseFrontmatter extracts top-level scalars and body', () => {
  const text = [
    '---',
    'name: security-review',
    'description: Use this skill when handling secrets, input, or auth.',
    'tools: ["Read", "Write"]',
    'metadata:',
    '  nested: ignored',
    '---',
    '',
    '# Body heading',
    'content',
  ].join('\n');
  const { data, body } = parseFrontmatter(text);
  assert.equal(data.name, 'security-review');
  assert.equal(data.description, 'Use this skill when handling secrets, input, or auth.');
  assert.equal(data.tools, '["Read", "Write"]'); // captured as raw string
  assert.equal(data.nested, undefined); // indented/nested lines ignored
  assert.ok(body.startsWith('# Body heading'));
});

test('parseFrontmatter returns empty data when no frontmatter', () => {
  const { data, body } = parseFrontmatter('# Just a doc\n\nhello');
  assert.deepEqual(data, {});
  assert.ok(body.includes('Just a doc'));
});

test('oneLine collapses whitespace and clips long text', () => {
  assert.equal(oneLine('a\n  b   c'), 'a b c');
  const long = 'x'.repeat(300);
  const clipped = oneLine(long, 50);
  assert.ok(clipped.length <= 50);
  assert.ok(clipped.endsWith('…'));
});

test('isAllowedFile accepts text and rejects code/binary/secrets', () => {
  assert.equal(isAllowedFile('SKILL.md'), true);
  assert.equal(isAllowedFile('servers.catalog.json'), true);
  assert.equal(isAllowedFile('notes.yaml'), true);
  assert.equal(isAllowedFile('hook.js'), false);
  assert.equal(isAllowedFile('run.sh'), false);
  assert.equal(isAllowedFile('logo.png'), false);
  assert.equal(isAllowedFile('README'), false); // no extension
});

test('isSecretLike flags credential-shaped filenames', () => {
  assert.equal(isSecretLike('.env'), true);
  assert.equal(isSecretLike('.env.example'), true);
  assert.equal(isSecretLike('server.pem'), true);
  assert.equal(isSecretLike('id_rsa'), true);
  assert.equal(isSecretLike('SKILL.md'), false);
  assert.equal(isAllowedFile('.env.example'), false); // secrets are never allowed
});

test('buildKnowledgeSection is empty without content and populated with it', () => {
  assert.equal(buildKnowledgeSection(null), '');
  assert.equal(buildKnowledgeSection({ counts: { skills: 0, agents: 0, commands: 0 } }), '');

  const section = buildKnowledgeSection({
    counts: { skills: 262, agents: 64, commands: 84 },
    source: { id: 'ecc', repo: 'https://github.com/affaan-m/ECC', license: 'MIT' },
  });
  assert.ok(section.includes('# Knowledge Base'));
  assert.ok(section.includes('262'));
  assert.ok(section.includes('knowledge/INDEX.md'));
  assert.ok(section.includes('knowledge/NOTICE.md'));
});

test('buildIndexMarkdown renders sorted catalog sections', () => {
  const md = buildIndexMarkdown({
    source: { repo: 'https://github.com/affaan-m/ECC', commit: 'abcdef1234567890', license: 'MIT' },
    skills: [
      { name: 'zeta', description: 'last', path: 'knowledge/skills/zeta/SKILL.md' },
      { name: 'alpha', description: 'first', path: 'knowledge/skills/alpha/SKILL.md' },
    ],
    agents: [{ name: 'architect', description: 'design', path: 'knowledge/agents/architect.md' }],
    commands: [{ name: 'plan', description: 'plan it', path: 'knowledge/commands/plan.md' }],
  });
  assert.ok(md.includes('## Skills (2)'));
  assert.ok(md.includes('## Agents (1)'));
  assert.ok(md.includes('## Commands (1)'));
  // alpha sorts before zeta
  assert.ok(md.indexOf('alpha') < md.indexOf('zeta'));
  assert.ok(md.includes('abcdef1234')); // short commit
});

test('loadKnowledgeManifest tolerates a missing manifest', () => {
  const m = loadKnowledgeManifest('knowledge/__does_not_exist__.json');
  assert.equal(m, null);
});
