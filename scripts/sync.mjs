#!/usr/bin/env node
// sync.mjs
// Compose first-party rules/ into generated agent-config files for every
// supported coding agent. Supports --dry-run (preview) and --check (validate).
//
// Managed blocks are delimited by markers so user content outside them is
// preserved on re-run.

import process from 'node:process';
import { pathToFileURL } from 'node:url';

import {
  exists,
  readText,
  writeText,
  listDir,
  readJson,
} from './lib/fs-safe.mjs';
import {
  withHeader,
  managedBlock,
  upsertManaged,
  BEGIN_MARK,
  END_MARK,
} from './lib/markers.mjs';
import { header, ok, warn, info, step, summary, line } from './lib/report.mjs';

import claude from './adapters/claude.mjs';
import cursor from './adapters/cursor.mjs';
import codex from './adapters/codex.mjs';
import gemini from './adapters/gemini.mjs';
import opencode from './adapters/opencode.mjs';
import grokBuild from './adapters/grok-build.mjs';
import copilot from './adapters/copilot.mjs';

const ADAPTERS = [claude, cursor, codex, gemini, opencode, grokBuild, copilot];

export function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    check: argv.includes('--check'),
  };
}

/** Read and concatenate rule files in manifest order (or numeric filename order). */
export function loadRulesText() {
  let order = [];
  if (exists('rules/manifest.json')) {
    try {
      const m = readJson('rules/manifest.json');
      order = (m.rules || []).map((r) => (typeof r === 'string' ? r : r.file)).filter(Boolean);
    } catch {
      order = [];
    }
  }
  if (order.length === 0) {
    order = listDir('rules').filter((f) => f.endsWith('.md')).sort();
  }

  const parts = [];
  for (const file of order) {
    const rel = `rules/${file}`;
    if (exists(rel)) {
      parts.push(readText(rel).trim());
    }
  }
  return parts.join('\n\n---\n\n');
}

function buildAgentsMd(projectName, rulesText) {
  return withHeader(
    `# ${projectName} — Agent Instructions (AGENTS.md)\n\n`
    + 'Shared, cross-agent instructions. Supported agents: Claude Code, Codex, '
    + 'Gemini CLI, Cursor, OpenCode, Grok Build, GitHub Copilot.\n\n'
    + `${managedBlock(rulesText)}\n`,
  );
}

function buildDocsAgents(projectName) {
  return withHeader(
    `# Supported Agents\n\n`
    + `${projectName} generates configuration for the following coding agents from a `
    + 'single source of truth in `rules/`.\n\n'
    + '| Agent | Generated file(s) |\n'
    + '|---|---|\n'
    + '| Claude Code | `CLAUDE.md`, `.claude/settings.json` |\n'
    + '| Cursor | `.cursor/rules/' + projectName + '.mdc` |\n'
    + '| OpenAI Codex | `AGENTS.md`, `.codex/instructions.md` |\n'
    + '| Gemini CLI | `GEMINI.md`, `.gemini/settings.json` |\n'
    + '| OpenCode | `AGENTS.md`, `.opencode/instructions.md` |\n'
    + '| Grok Build | `AGENTS.md`, `.grok/instructions.md` |\n'
    + '| GitHub Copilot | `.github/copilot-instructions.md` |\n\n'
    + '## Policy\n\n'
    + 'Downloaded upstream sources are reference material until audited in '
    + '`docs/source-audit.md`. They are never imported or executed automatically.\n\n'
    + '## Validation\n\n'
    + '```bash\n'
    + 'npm run doctor\n'
    + 'npm run sources:download\n'
    + 'npm run sources:audit\n'
    + 'npm run security\n'
    + 'npm run sync -- --dry-run\n'
    + 'npm run test\n'
    + '```\n',
  );
}

export function planSync(projectName) {
  const rulesText = loadRulesText() || '_No rules defined yet. Add files under `rules/`._';
  const ctx = { projectName, rulesText };

  const outputs = [];
  outputs.push({ path: 'AGENTS.md', content: buildAgentsMd(projectName, rulesText), managed: true });
  outputs.push({ path: 'docs/agents.md', content: buildDocsAgents(projectName), managed: false });

  for (const adapter of ADAPTERS) {
    const files = adapter.generate(ctx);
    for (const f of files) {
      outputs.push({ ...f, agent: adapter.id });
    }
  }
  return outputs;
}

function writeOutput(out) {
  // For root markdown docs that may contain user content, preserve outside the
  // managed block. For JSON / generated dotfiles, overwrite wholesale.
  if (out.managed && exists(out.path) && out.path.endsWith('.md')) {
    const existing = readText(out.path);
    // Re-derive only the managed portion from the freshly generated content.
    const begin = out.content.indexOf(BEGIN_MARK);
    const end = out.content.indexOf(END_MARK);
    if (begin !== -1 && end !== -1) {
      const managedContent = out.content.slice(begin + BEGIN_MARK.length, end).trim();
      const merged = upsertManaged(existing, managedContent);
      writeText(out.path, merged);
      return;
    }
  }
  writeText(out.path, out.content);
}

export function runSync(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const mode = args.dryRun ? 'dry-run' : args.check ? 'check' : 'write';
  header(`sdd_template sync (${mode})`);

  const projectName = 'sdd_template';
  const outputs = planSync(projectName);

  // Validate every output has the auto-generated header marker.
  let invalid = 0;
  for (const out of outputs) {
    const needsHeader = out.path.endsWith('.md') || out.path.endsWith('.mdc');
    if (needsHeader && !out.content.includes('AUTO-GENERATED by sdd_template')) {
      warn(`missing auto-generated header: ${out.path}`);
      invalid += 1;
    }
  }

  if (args.dryRun || args.check) {
    for (const out of outputs) {
      info(`${out.agent ? `[${out.agent}] ` : ''}${out.path} (${out.content.length} bytes)`);
    }
    line();
    summary({
      Mode: mode,
      'Planned files': outputs.length,
      'Header issues': invalid,
    });
    line();
    if (invalid > 0) {
      warn('sync validation found header issues');
      return { code: 1, outputs };
    }
    ok(`sync ${mode} complete (no files written)`);
    return { code: 0, outputs };
  }

  for (const out of outputs) {
    step(`write ${out.path}`);
    writeOutput(out);
  }
  line();
  summary({ Mode: mode, 'Files written': outputs.length });
  line();
  ok('sync complete');
  return { code: 0, outputs };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code } = runSync();
  process.exit(code);
}
