#!/usr/bin/env node
// review.mjs
// Lightweight self-review helper. Summarizes pending skill/rule suggestions and
// reminds the operator that human approval is required before applying them.
// This script never auto-applies suggestions.

import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { exists, listDir } from './lib/fs-safe.mjs';
import { header, ok, info, warn, summary, line } from './lib/report.mjs';

export function runReview() {
  header('sdd_template review');

  const pending = exists('suggestions/pending')
    ? listDir('suggestions/pending').filter((f) => !f.startsWith('.'))
    : [];
  const approved = exists('suggestions/approved')
    ? listDir('suggestions/approved').filter((f) => !f.startsWith('.'))
    : [];
  const rejected = exists('suggestions/rejected')
    ? listDir('suggestions/rejected').filter((f) => !f.startsWith('.'))
    : [];

  summary({
    Pending: pending.length,
    Approved: approved.length,
    Rejected: rejected.length,
  });

  line();
  if (pending.length > 0) {
    warn('Pending suggestions require human approval before they are applied:');
    for (const f of pending) info(`suggestions/pending/${f}`);
    info('See rules/60-human-approval.md for the approval policy.');
  } else {
    ok('No pending suggestions.');
  }

  line();
  ok('review complete');
  return { code: 0 };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code } = runReview();
  process.exit(code);
}
