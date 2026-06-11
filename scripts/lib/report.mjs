// report.mjs
// Small console formatting helpers used by the bootstrap scripts.
// Colors are disabled automatically when output is not a TTY or NO_COLOR is set.

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

const c = (code) => (s) => (useColor ? `\u001b[${code}m${s}\u001b[0m` : `${s}`);

export const color = {
  bold: c('1'),
  dim: c('2'),
  red: c('31'),
  green: c('32'),
  yellow: c('33'),
  blue: c('34'),
  cyan: c('36'),
};

export function header(title) {
  console.log(`\n${color.bold(color.cyan(title))}`);
}

export function step(msg) {
  console.log(`${color.blue('→')} ${msg}`);
}

export function ok(msg) {
  console.log(`${color.green('✓')} ${msg}`);
}

export function warn(msg) {
  console.log(`${color.yellow('!')} ${msg}`);
}

export function fail(msg) {
  console.log(`${color.red('✗')} ${msg}`);
}

export function info(msg) {
  console.log(`  ${color.dim(msg)}`);
}

export function line() {
  console.log('');
}

/** Print a compact summary object as aligned key: value pairs. */
export function summary(obj) {
  const keys = Object.keys(obj);
  const width = Math.max(...keys.map((k) => k.length));
  for (const k of keys) {
    console.log(`  ${k.padEnd(width)} : ${obj[k]}`);
  }
}

export default { color, header, step, ok, warn, fail, info, line, summary };
