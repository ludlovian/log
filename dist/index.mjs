import { red, green, yellow, blue, magenta, cyan, grey } from 'kleur/colors';

const CSI = '\u001B[';
const CR = '\r';
const EOL = `${CSI}0K`;
const RE_DECOLOR = /(^|[^\x1b]*)((?:\x1b\[\d*m)|$)/g;
function log (string, { newline = true, limitWidth } = {}) {
  if (log.prefix) {
    string = log.prefix + string;
  }
  if (limitWidth && log.width) {
    string = truncateToWidth(string, log.width);
  }
  if (log.dirty) {
    string = CR + EOL + string;
  }
  if (newline) {
    string = string + '\n';
    log.dirty = false;
  } else {
    log.dirty = true;
  }
  log.write(string);
}
Object.assign(log, {
  write: process.stdout.write.bind(process.stdout),
  status: string =>
    log(string, {
      newline: false,
      limitWidth: true
    }),
  prefix: '',
  width: process.stdout.columns,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  grey
});
process.stdout.on('resize', () => {
  log.width = process.stdout.columns;
});
function truncateToWidth (string, width) {
  const maxLength = width - 2;
  if (string.length <= maxLength) return string
  const parts = [];
  let w = 0;
  let full;
  for (const match of string.matchAll(RE_DECOLOR)) {
    const [, text, ansiCode] = match;
    if (full) {
      parts.push(ansiCode);
      continue
    } else if (w + text.length <= maxLength) {
      parts.push(text, ansiCode);
      w += text.length;
    } else {
      parts.push(text.slice(0, maxLength - w), ansiCode);
      full = true;
    }
  }
  return parts.join('')
}

export default log;
