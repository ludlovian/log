import { format } from 'util'
import { red, green, yellow, blue, magenta, cyan } from 'kleur/colors'

const colourFuncs = { cyan, green, yellow, blue, magenta, red }
const colours = Object.keys(colourFuncs)
const CLEAR_LINE = '\r\x1b[0K'
const RE_DECOLOR = /(^|[^\x1b]*)((?:\x1b\[\d*m)|$)/g // eslint-disable-line no-control-regex

const state = {
  dirty: false,
  width: process.stdout && process.stdout.columns,
  level: process.env.LOGLEVEL,
  write: process.stdout.write.bind(process.stdout)
}

process.stdout &&
  process.stdout.on('resize', () => (state.width = process.stdout.columns))

function _log (
  args,
  { newline = true, limitWidth, prefix = '', level, colour }
) {
  if (level && (!state.level || state.level < level)) return
  const msg = format(...args)
  let string = prefix + msg
  if (colour && colour in colourFuncs) string = colourFuncs[colour](string)
  if (limitWidth) string = truncate(string, state.width)
  if (newline) string = string + '\n'
  if (state.dirty) string = CLEAR_LINE + string
  state.dirty = !newline && !!msg
  state.write(string)
}

function truncate (string, max) {
  max -= 2 // leave two chars at end
  if (string.length <= max) return string
  const parts = []
  let w = 0
  ;[...string.matchAll(RE_DECOLOR)].forEach(([, txt, clr]) => {
    parts.push(txt.slice(0, max - w), clr)
    w = Math.min(w + txt.length, max)
  })
  return parts.join('')
}

function merge (old, new_) {
  const prefix = (old.prefix || '') + (new_.prefix || '')
  return { ...old, ...new_, prefix }
}

function logger (options) {
  return Object.defineProperties((...args) => _log(args, options), {
    _preset: { value: options, configurable: true },
    _state: { value: state, configurable: true },
    name: { value: 'log', configurable: true }
  })
}

function nextColour () {
  const clr = colours.shift()
  colours.push(clr)
  return clr
}

function fixup (log) {
  const p = log._preset
  Object.assign(log, {
    status: logger(merge(p, { newline: false, limitWidth: true })),
    level: level => fixup(logger(merge(p, { level }))),
    colour: colour =>
      fixup(logger(merge(p, { colour: colour || nextColour() }))),
    prefix: prefix => fixup(logger(merge(p, { prefix }))),
    ...colourFuncs
  })
  return log
}

const log = fixup(logger({}))
export default log
