import { format } from 'util'
import { painter, randomColour, colours, truncate } from './colours.mjs'

const CLEAR_LINE = '\r\x1b[0K'

const state = {
  dirty: false,
  width: process.stdout && process.stdout.columns,
  /* c8 ignore next */
  level: process.env.LOGLEVEL ? parseInt(process.env.LOGLEVEL, 10) : undefined,
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
  if (colour != null) string = painter(colour)(string)
  if (limitWidth) string = truncate(string, state.width)
  if (newline) string = string + '\n'
  if (state.dirty) string = CLEAR_LINE + string
  state.dirty = !newline && !!msg
  state.write(string)
}

function makeLogger (base, changes = {}) {
  const baseOptions = base ? base._preset : {}
  const options = {
    ...baseOptions,
    ...changes,
    prefix: (baseOptions.prefix || '') + (changes.prefix || '')
  }
  const configurable = true
  const fn = (...args) => _log(args, options)
  const addLevel = level => makeLogger(fn, { level })
  const addColour = c =>
    makeLogger(fn, { colour: c in colours ? colours[c] : randomColour() })
  const addPrefix = prefix => makeLogger(fn, { prefix })
  const status = () => makeLogger(fn, { newline: false, limitWidth: true })

  const colourFuncs = Object.fromEntries(
    Object.entries(colours).map(([name, n]) => [
      name,
      { value: painter(n), configurable }
    ])
  )

  return Object.defineProperties(fn, {
    _preset: { value: options, configurable },
    _state: { value: state, configurable },
    name: { value: 'log', configurable },
    level: { value: addLevel, configurable },
    colour: { value: addColour, configurable },
    prefix: { value: addPrefix, configurable },
    status: { get: status, configurable },
    ...colourFuncs
  })
}

const log = makeLogger()
export default log
