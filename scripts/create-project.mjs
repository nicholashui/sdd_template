#!/usr/bin/env node
// create-project.mjs
// Scaffold a new downstream project from this starter template.
//
// Usage:
//   node scripts/create-project.mjs --name demo --path ../demo
//   node scripts/create-project.mjs --name demo --path ../demo --purpose "Example"
//   node scripts/create-project.mjs --name demo --path ../demo --no-download
//   node scripts/create-project.mjs --name demo --path ../demo --force
//
// The new project is a working copy of the template scripts/manifests/rules/docs
// with project metadata replaced. Downloaded sources are NOT copied.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { PROJECT_ROOT } from './lib/fs-safe.mjs';
import { header, ok, fail, step, info, warn, line } from './lib/report.mjs';

// Template items copied into a new project (relative to PROJECT_ROOT).
const TEMPLATE_ITEMS = [
  'scripts',
  'rules',
  'skills',
  'hooks',
  'mcp-configs',
  'memory',
  'docs',
  'examples',
  'tests',
  'sources/manifest.json',
  'sources/docs-manifest.json',
  'sources/README.md',
  'package.json',
  '.gitignore',
  '.editorconfig',
  'external/.gitignore',
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'task.md',
  'project_starter.md',
];

const DEFAULTS = {
  name: 'project_starter_generated',
  purpose: 'AI coding-agent starter repository',
  stack: 'Node.js 20+, plain JavaScript, no runtime dependencies for bootstrap scripts',
};

export function parseArgs(argv) {
  const args = {
    name: null,
    path: null,
    purpose: DEFAULTS.purpose,
    stack: DEFAULTS.stack,
    download: true,
    force: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[(i += 1)];
    if (a === '--name') args.name = next();
    else if (a === '--path') args.path = next();
    else if (a === '--purpose') args.purpose = next();
    else if (a === '--stack') args.stack = next();
    else if (a === '--no-download') args.download = false;
    else if (a === '--force') args.force = true;
    else if (a.startsWith('--name=')) args.name = a.split('=')[1];
    else if (a.startsWith('--path=')) args.path = a.split('=')[1];
    else if (a.startsWith('--purpose=')) args.purpose = a.split('=').slice(1).join('=');
    else if (a.startsWith('--stack=')) args.stack = a.split('=').slice(1).join('=');
  }
  return args;
}

function validName(name) {
  return typeof name === 'string' && /^[A-Za-z0-9._-]+$/.test(name);
}

function isNonEmptyDir(dir) {
  try {
    return fs.statSync(dir).isDirectory() && fs.readdirSync(dir).length > 0;
  } catch {
    return false;
  }
}

function copyItem(srcAbs, destAbs) {
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  fs.cpSync(srcAbs, destAbs, {
    recursive: true,
    filter: (s) => {
      const base = path.basename(s);
      // Never copy VCS, node_modules, downloaded sources, or lockfiles.
      if (base === '.git' || base === 'node_modules') return false;
      if (s.includes(`${path.sep}external${path.sep}sources`)) return false;
      if (s.includes(`${path.sep}external${path.sep}docs`)) return false;
      if (base === 'source-lock.json') return false;
      return true;
    },
  });
}

export function runCreate(argv = process.argv.slice(2)) {
  header('sdd_template create');

  const args = parseArgs(argv);
  const name = args.name || DEFAULTS.name;
  if (!validName(name)) {
    fail(`invalid project name: "${name}" (use letters, digits, . _ -)`);
    return { code: 1 };
  }
  const targetRel = args.path || `./${name}`;
  const targetAbs = path.resolve(process.cwd(), targetRel);

  info(`Name:    ${name}`);
  info(`Path:    ${targetAbs}`);
  info(`Purpose: ${args.purpose}`);
  info(`Stack:   ${args.stack}`);
  info(`Download sources: ${args.download ? 'yes' : 'no'}`);

  if (isNonEmptyDir(targetAbs) && !args.force) {
    line();
    fail(`target directory is not empty: ${targetAbs}`);
    info('Re-run with --force to overwrite, or choose an empty --path.');
    return { code: 1 };
  }

  fs.mkdirSync(targetAbs, { recursive: true });
  fs.mkdirSync(path.join(targetAbs, 'external', 'sources'), { recursive: true });

  step('copying template files');
  for (const item of TEMPLATE_ITEMS) {
    const srcAbs = path.join(PROJECT_ROOT, item);
    if (!fs.existsSync(srcAbs)) continue;
    const destAbs = path.join(targetAbs, item);
    copyItem(srcAbs, destAbs);
  }

  // Replace project metadata in package.json.
  step('rewriting project metadata');
  const pkgPath = path.join(targetAbs, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.name = name;
    pkg.description = `${args.purpose} (${args.stack}).`;
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  }

  // Fresh status.md for the new project.
  const status = `# Status

## Current phase

Bootstrap implementation.

## Latest update

Project "${name}" scaffolded from sdd_template on ${new Date().toISOString()}.

## Blockers

None yet.

## Commands to run

\`\`\`bash
npm run bootstrap
\`\`\`
`;
  fs.writeFileSync(path.join(targetAbs, 'status.md'), status, 'utf8');

  ok(`project "${name}" created at ${targetAbs}`);

  if (args.download) {
    line();
    step('downloading sources in the new project');
    try {
      execFileSync(process.execPath, ['scripts/source-download.mjs'], {
        cwd: targetAbs,
        stdio: 'inherit',
      });
    } catch {
      warn('source download failed in the new project; you can re-run `npm run sources:download` there.');
    }
  } else {
    info('skipping source download (--no-download).');
  }

  line();
  header('next steps');
  info(`cd ${targetRel}`);
  info('npm run bootstrap');
  return { code: 0 };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code } = runCreate();
  process.exit(code);
}
