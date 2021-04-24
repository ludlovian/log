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
  log.write = s => context.log.push(s)
  log.dirty = false
  log.width = 100
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
  log.prefix = 'foo'
  log('bar')
  log.prefix = ''
  log.status('baz')
  assert.equal(context.log, ['foobar\n', 'baz'])
})

test('colours', context => {
  log(`${log.red('foo')} ${log.blue('bar')}`)

  assert.equal(context.log, [`${RED}foo${RESET} ${BLUE}bar${RESET}\n`])
})

test('truncate mono', context => {
  log.width = 5
  log.status('foobar')

  assert.equal(context.log, ['foo'])
})

test('truncate colours', context => {
  log.width = 6
  log.status(`${log.red('foo')}${log.blue('bar')}${log.green('baz')}`)

  assert.equal(context.log, [
    `${RED}foo${RESET}${BLUE}b${RESET}${GREEN}${RESET}`
  ])
})

test('react to width', () => {
  process.stdout.columns = 17
  process.stdout.emit('resize')
  assert.is(log.width, 17)
})

test('setting dirty', () => {
  assert.not.ok(log.dirty)

  log('foo')
  assert.not.ok(log.dirty)

  log.status('bar')
  assert.ok(log.dirty)

  log.prefix = 'baz'
  log.status('')
  assert.ok(log.dirty)

  log.prefix = ''
  log.status('')
  assert.not.ok(log.dirty)
})

test.run()
