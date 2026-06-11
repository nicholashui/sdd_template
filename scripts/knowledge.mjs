#!/usr/bin/env node
// knowledge.mjs
// Import, index, and project the shared knowledge base.
//
// Commands:
//   import            Vendor skills/agents/commands from a downloaded source
//                     (default: external/sources/ecc) into knowledge/.
//                     Text content only — never executes or copies code/secrets.
//   index             Regenerate knowledge/INDEX.md from knowledge/manifest.json.
//   mirror [--agent]  Mirror knowledge/ into an agent's native skills dir
//                     (default: .claude) for auto-discovery. Opt-in.
//   sync [--mirror]   index (+ mirror when --mirror is passed).
//
// The default --source is the ECC harness (https://github.com/affaan-m/ECC),
// which is MIT licensed. Attribution is written to knowledge/NOTICE.md.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import {
  PROJECT_ROOT,
  resolveInRoot,
  exists,
  isDir,
  ensureDir,
  readText,
  writeText,
  writeJson,
  readJson,
  listDir,
} from './lib/fs-safe.mjs';
import { AUTO_HEADER } from './lib/markers.mjs';
import {
  header,
  ok,
  warn,
  fail,
  info,
  step,
  line,
  summary,
} from './lib/report.mjs';
import {
  KNOWLEDGE_ROOT,
  KNOWLEDGE_MANIFEST_PATH,
  isAllowedFile,
  parseFrontmatter,
  oneLine,
  buildIndexMarkdown,
} from './lib/knowledge.mjs';

const DEFAULT_SOURCE_ID = 'ecc';
const SOURCES_ROOT = 'external/sources';

function parseArgs(argv) {
  const args = { mirror: false, source: DEFAULT_SOURCE_ID, agent: 'claude' };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--mirror') args.mirror = true;
    else if (a === '--source') args.source = argv[++i];
    else if (a === '--agent') args.agent = argv[++i];
  }
  return args;
}

/** Recursively list files under a relative dir (project-root scoped). */
function walkFiles(relDir) {
  const out = [];
  if (!exists(relDir) || !isDir(relDir)) return out;
  for (const name of fs.readdirSync(resolveInRoot(relDir), { withFileTypes: true })) {
    if (name.name === '.git' || name.name === 'node_modules') continue;
    const child = path.posix.join(relDir, name.name);
    if (name.isDirectory()) out.push(...walkFiles(child));
    else out.push(child);
  }
  return out;
}

function copyInRoot(srcRel, destRel) {
  const absSrc = resolveInRoot(srcRel);
  const absDest = resolveInRoot(destRel);
  fs.mkdirSync(path.dirname(absDest), { recursive: true });
  fs.copyFileSync(absSrc, absDest);
}

function rmInRoot(relDir) {
  fs.rmSync(resolveInRoot(relDir), { recursive: true, force: true });
}

/** Resolve source provenance (repo url + commit) from the source lock/manifest. */
function resolveSourceMeta(sourceId) {
  const meta = { id: sourceId, repo: null, commit: null, license: 'MIT' };
  try {
    if (exists('sources/source-lock.json')) {
      const lock = readJson('sources/source-lock.json');
      const entry = (lock.sources || []).find((s) => s.id === sourceId);
      if (entry) {
        meta.repo = entry.resolved_url || entry.url || null;
        meta.commit = entry.commit || null;
      }
    }
    if (!meta.repo && exists('sources/manifest.json')) {
      const m = readJson('sources/manifest.json');
      const entry = (m.sources || []).find((s) => s.id === sourceId);
      if (entry) meta.repo = entry.url || null;
    }
  } catch {
    // best-effort provenance only
  }
  if (meta.repo) meta.repo = meta.repo.replace(/\.git$/, '');
  return meta;
}

function importSkills(srcRoot, skipped) {
  const items = [];
  const skillsRoot = `${srcRoot}/skills`;
  if (!isDir(skillsRoot)) return items;

  for (const dirName of listDir(skillsRoot).sort()) {
    const skillDirRel = `${skillsRoot}/${dirName}`;
    if (!isDir(skillDirRel)) continue;
    const skillMd = `${skillDirRel}/SKILL.md`;
    if (!exists(skillMd)) continue;

    const destDir = `${KNOWLEDGE_ROOT}/skills/${dirName}`;
    let resources = 0;
    for (const fileRel of walkFiles(skillDirRel)) {
      const base = path.basename(fileRel);
      if (!isAllowedFile(base)) {
        skipped.push(fileRel);
        continue;
      }
      const sub = path.posix.relative(skillDirRel, fileRel);
      copyInRoot(fileRel, `${destDir}/${sub}`);
      if (base !== 'SKILL.md') resources += 1;
    }

    const { data } = parseFrontmatter(readText(skillMd));
    items.push({
      name: data.name || dirName,
      description: oneLine(data.description),
      path: `${destDir}/SKILL.md`,
      resources,
    });
  }
  return items;
}

function importFlatMarkdown(srcRoot, subdir, skipped) {
  const items = [];
  const root = `${srcRoot}/${subdir}`;
  if (!isDir(root)) return items;

  for (const name of listDir(root).sort()) {
    const fileRel = `${root}/${name}`;
    if (isDir(fileRel)) continue;
    if (!isAllowedFile(name) || !/\.(md|markdown)$/i.test(name)) {
      skipped.push(fileRel);
      continue;
    }
    const destRel = `${KNOWLEDGE_ROOT}/${subdir}/${name}`;
    copyInRoot(fileRel, destRel);
    const { data } = parseFrontmatter(readText(fileRel));
    const fallbackName = name.replace(/\.(md|markdown)$/i, '');
    items.push({
      name: data.name || fallbackName,
      description: oneLine(data.description),
      path: destRel,
      ...(data.model ? { model: data.model } : {}),
    });
  }
  return items;
}

/** Import reference-only material (hooks, mcp, plugins) — never wired to run. */
function importReferences(srcRoot, skipped) {
  const refs = {};
  const ensureCopy = (fromRel, toRel) => {
    if (exists(fromRel) && isAllowedFile(path.basename(fromRel))) {
      copyInRoot(fromRel, toRel);
      return toRel;
    }
    return null;
  };

  // Hooks: documentation only. The executable hook scripts are intentionally
  // NOT imported (they are plugin-runtime specific and out of scope).
  const hookDocs = [];
  for (const fileRel of walkFiles(`${srcRoot}/hooks`)) {
    if (/README\.md$/i.test(fileRel)) {
      const sub = path.posix.relative(`${srcRoot}/hooks`, fileRel);
      const dest = `${KNOWLEDGE_ROOT}/references/hooks/${sub}`;
      copyInRoot(fileRel, dest);
      hookDocs.push(dest);
    } else {
      skipped.push(fileRel);
    }
  }
  if (hookDocs.length) refs.hooks = hookDocs;

  // MCP server catalog (placeholders only; reference, not active config).
  const mcpDest = ensureCopy(
    `${srcRoot}/mcp-configs/mcp-servers.json`,
    `${KNOWLEDGE_ROOT}/references/mcp/servers.catalog.json`,
  );
  if (mcpDest) refs.mcp = [mcpDest];

  // Plugins: installation guide only.
  const pluginsDest = ensureCopy(
    `${srcRoot}/plugins/README.md`,
    `${KNOWLEDGE_ROOT}/references/plugins/README.md`,
  );
  if (pluginsDest) refs.plugins = [pluginsDest];

  return refs;
}

function writeNotice(meta, srcRoot) {
  let licenseBody = '';
  if (exists(`${srcRoot}/LICENSE`)) {
    try {
      licenseBody = readText(`${srcRoot}/LICENSE`).trim();
    } catch {
      licenseBody = '';
    }
  }
  const body = `# Knowledge Base — Attribution & License

The content under \`knowledge/\` is vendored from third-party, openly licensed
sources and is included here as reference guidance for AI coding agents. It is
**not** executed by this project.

## Source

- **Project:** Everything Claude Code (ECC)
- **Repository:** ${meta.repo || 'https://github.com/affaan-m/ECC'}
${meta.commit ? `- **Imported commit:** \`${meta.commit}\`\n` : ''}- **License:** ${meta.license}

Imported by \`scripts/knowledge.mjs\` on ${new Date().toISOString().slice(0, 10)}.
Re-run \`npm run knowledge:import\` to refresh from the downloaded source.

${licenseBody ? `## Upstream LICENSE\n\n\`\`\`\n${licenseBody}\n\`\`\`\n` : ''}`;
  writeText(`${KNOWLEDGE_ROOT}/NOTICE.md`, body);
}

function writeReadme(manifest) {
  const { skills, agents, commands } = manifest.counts;
  const body = `${AUTO_HEADER}

# Knowledge Base

A curated, audited corpus shared across **every** supported coding agent so they
all work from the same playbook.

| Kind | Count | Location |
|---|---|---|
| Skills | ${skills} | \`knowledge/skills/<name>/SKILL.md\` |
| Agents | ${agents} | \`knowledge/agents/<name>.md\` |
| Commands | ${commands} | \`knowledge/commands/<name>.md\` |

- **Full catalog:** [\`INDEX.md\`](INDEX.md)
- **Provenance & license:** [\`NOTICE.md\`](NOTICE.md)
- **Reference-only material** (not wired to execute): \`knowledge/references/\`
  (MCP server catalog, hook docs, plugin guide).

## How it is produced

\`\`\`bash
npm run sources:download   # fetch upstream sources into external/sources/
npm run knowledge:import   # vendor text content into knowledge/ (this dir)
npm run sync               # project the catalog into every agent config
\`\`\`

## Safety

Only text content (Markdown/JSON/YAML/TOML/CSV/TXT) is imported. Executable
scripts, binaries, and credential-shaped files are skipped. Nothing here is run
by this project; it is reference guidance for agents.

## Make it native to an agent (optional)

\`\`\`bash
npm run knowledge:mirror            # mirror into .claude/ for auto-discovery
npm run knowledge:mirror -- --agent claude
\`\`\`
`;
  writeText(`${KNOWLEDGE_ROOT}/README.md`, body);
}

function writeIndex(manifest) {
  writeText(`${KNOWLEDGE_ROOT}/INDEX.md`, `${AUTO_HEADER}\n\n${buildIndexMarkdown(manifest)}\n`);
}

function cmdImport(argv) {
  const args = parseArgs(argv);
  header('sdd_template knowledge:import');

  const srcRoot = `${SOURCES_ROOT}/${args.source}`;
  if (!exists(srcRoot) || !isDir(srcRoot)) {
    warn(`source not found: ${srcRoot}`);
    info('Run `npm run sources:download` first. Skipping import (non-fatal).');
    return 0;
  }

  // Clean previously generated content for a deterministic import.
  for (const sub of ['skills', 'agents', 'commands', 'references']) {
    rmInRoot(`${KNOWLEDGE_ROOT}/${sub}`);
  }

  const skipped = [];
  step('importing skills');
  const skills = importSkills(srcRoot, skipped);
  step('importing agents');
  const agents = importFlatMarkdown(srcRoot, 'agents', skipped);
  step('importing commands');
  const commands = importFlatMarkdown(srcRoot, 'commands', skipped);
  step('importing references (hooks/mcp/plugins)');
  const references = importReferences(srcRoot, skipped);

  const meta = resolveSourceMeta(args.source);
  const manifest = {
    schema_version: '1.0',
    generated_at: new Date().toISOString(),
    generator: 'scripts/knowledge.mjs',
    description:
      'Vendored, audited knowledge corpus shared across all supported coding agents. '
      + 'Text content only; never executed.',
    source: meta,
    counts: {
      skills: skills.length,
      agents: agents.length,
      commands: commands.length,
    },
    skipped_files: skipped.length,
    references,
    skills,
    agents,
    commands,
  };

  writeJson(KNOWLEDGE_MANIFEST_PATH, manifest);
  writeNotice(meta, srcRoot);
  writeReadme(manifest);
  writeIndex(manifest);

  line();
  summary({
    Source: `${srcRoot}${meta.commit ? ` @ ${String(meta.commit).slice(0, 10)}` : ''}`,
    Skills: skills.length,
    Agents: agents.length,
    Commands: commands.length,
    'Skipped (non-text/unsafe)': skipped.length,
  });
  line();
  ok('knowledge:import complete');
  return 0;
}

function cmdIndex() {
  header('sdd_template knowledge:index');
  const manifest = exists(KNOWLEDGE_MANIFEST_PATH) ? readJson(KNOWLEDGE_MANIFEST_PATH) : null;
  if (!manifest) {
    warn('no knowledge/manifest.json — run `npm run knowledge:import` first.');
    return 0;
  }
  writeIndex(manifest);
  writeReadme(manifest);
  ok(`knowledge:index complete (${manifest.counts.skills} skills, `
    + `${manifest.counts.agents} agents, ${manifest.counts.commands} commands)`);
  return 0;
}

function cmdMirror(argv) {
  const args = parseArgs(argv);
  header(`sdd_template knowledge:mirror (${args.agent})`);

  if (!exists(`${KNOWLEDGE_ROOT}/skills`)) {
    warn('nothing to mirror — run `npm run knowledge:import` first.');
    return 0;
  }

  const targets = {
    claude: '.claude',
  };
  const base = targets[args.agent];
  if (!base) {
    fail(`unsupported --agent "${args.agent}" (supported: ${Object.keys(targets).join(', ')})`);
    return 1;
  }

  let count = 0;
  for (const kind of ['skills', 'agents', 'commands']) {
    const from = `${KNOWLEDGE_ROOT}/${kind}`;
    if (!exists(from)) continue;
    const to = `${base}/${kind}`;
    rmInRoot(to);
    ensureDir(to);
    fs.cpSync(resolveInRoot(from), resolveInRoot(to), { recursive: true });
    const n = walkFiles(to).length;
    count += n;
    step(`mirrored ${kind} -> ${to} (${n} files)`);
  }

  writeText(
    `${base}/skills/_GENERATED.md`,
    `${AUTO_HEADER}\n\n# Mirrored Knowledge\n\n`
    + 'These skills/agents/commands are mirrored from `knowledge/` by '
    + '`npm run knowledge:mirror`. Edit the canonical files under `knowledge/`, '
    + 'then re-run the mirror. Do not edit here.\n',
  );

  line();
  summary({ Agent: args.agent, 'Files mirrored': count });
  line();
  ok('knowledge:mirror complete');
  return 0;
}

function cmdSync(argv) {
  const args = parseArgs(argv);
  const idx = cmdIndex();
  if (idx !== 0) return idx;
  if (args.mirror) return cmdMirror(argv);
  return 0;
}

export function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  switch (command) {
    case 'import':
      return cmdImport(rest);
    case 'index':
      return cmdIndex();
    case 'mirror':
      return cmdMirror(rest);
    case 'sync':
      return cmdSync(rest);
    default:
      header('sdd_template knowledge');
      info('Usage: node scripts/knowledge.mjs <import|index|mirror|sync> [--source <id>] [--agent <id>] [--mirror]');
      return command ? 1 : 0;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}

export { resolveSourceMeta };
