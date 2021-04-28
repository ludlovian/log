import { test } from 'uvu'
import * as assert from 'uvu/assert'

import log from '../src/index.mjs'

const CLR_EOL = '\x1b[0K'
const RED = '\x1b[31m'
const BLUE = '\x1b[34m'
const GREEN = '\x1b[32m'
const RESET = '\x1b[39m'

test.before.each(context => {
  context.log = []
  Object.assign(log._state, {
    write: s => context.log.push(s),
    dirty: false,
    width: 100,
    level: undefined
  })
})

test('Basic logging', context => {
  log('foo')
  log('bar')

  assert.equal(context.log, ['foo\n', 'bar\n'])
})

test('Basic status', context => {
  log.status('foo')
  log.status('bar')

  assert.equal(context.log, ['foo', `\r${CLR_EOL}bar`])
})

test('prefix', context => {
  const log1 = log.prefix('foo')
  log1('bar')

  const log2 = log1.prefix('bar')
  log2.status('baz')
  assert.equal(context.log, ['foobar\n', 'foobarbaz'])
})

test('simple colours', context => {
  log(`${log.red('foo')} ${log.blue('bar')}`)

  assert.equal(context.log, [`${RED}foo${RESET} ${BLUE}bar${RESET}\n`])
})

test('colour logger', context => {
  const log2 = log.colour('red')
  log2(`foo ${log.blue('bar')}`)

  assert.equal(context.log, [
    [RED, 'foo ', BLUE, 'bar', RESET, RED, RESET, '\n'].join('')
  ])
})

test('truncate mono', context => {
  log._state.width = 5
  log.status('foobar')

  assert.equal(context.log, ['foo'])
})

test('truncate colours', context => {
  log._state.width = 6
  log.colour('red').status(`foo${log.blue('bar')}${log.green('baz')}`)

  assert.equal(context.log, [
    [RED, 'foo', BLUE, 'b', RESET, RED, GREEN, RESET, RED, RESET].join('')
  ])
})

test('react to width', () => {
  process.stdout.columns = 17
  process.stdout.emit('resize')
  assert.is(log._state.width, 17)
})

test('setting dirty', () => {
  assert.not.ok(log._state.dirty)

  log('foo')
  assert.not.ok(log._state.dirty)

  log.status('bar')
  assert.ok(log._state.dirty)

  log.prefix('bar').status('')
  assert.not.ok(log._state.dirty)
})

test('log levels', context => {
  // should not appeaer as no level set
  log.level(1)('foobar')

  log._state.level = 2
  log('foo') // appears always
  log.level(2)('bar') // appears based on level
  log.level(3)('baz') // misses based on logger level
  log.level(2).level(3)('quux') // missed based on later level

  assert.equal(context.log, ['foo\n', 'bar\n'])
})

test('printf like formatting', context => {
  log('foo %d %s', 17, 'bar')
  assert.equal(context.log, ['foo 17 bar\n'])
})

test('default colours', context => {
  log.colour()('foo')
  log.colour()('bar')
  assert.equal(context.log, [
    RED + 'foo' + RESET + '\n',
    GREEN + 'bar' + RESET + '\n'
  ])
})
test.run()
