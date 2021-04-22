import test from 'ava'
import log from '../src'

test.beforeEach(t => {
  t.context.log = []
  log.write = s => t.context.log.push(s)
  log.dirty = false
  log.width = 100
})

test.serial('Basic logging', t => {
  log('foo')
  log('bar')
  t.snapshot(t.context.log)
})

test.serial('Basic status', t => {
  log.status('foo')
  log.status('bar')
  t.snapshot(t.context.log)
})

test.serial('prefix', t => {
  log.prefix = 'foo'
  log('bar')
  log.prefix = ''
  log.status('baz')
  t.snapshot(t.context.log)
})

test.serial('colours', t => {
  log(`${log.red('foo')} ${log.blue('bar')}`)
  t.snapshot(t.context.log)
})

test.serial('truncate mono', t => {
  log.width = 5
  log.status('foobar')
  t.snapshot(t.context.log)
})

test.serial('truncate colours', t => {
  log.width = 6
  log.status(`${log.red('foo')}${log.blue('bar')}${log.green('baz')}`)
  t.snapshot(t.context.log)
})

test.serial('react to width', t => {
  process.stdout.columns = 17
  process.stdout.emit('resize')
  t.is(log.width, 17)
})

test.serial('setting dirty', t => {
  t.false(log.dirty)

  log('foo')
  t.false(log.dirty)

  log.status('bar')
  t.true(log.dirty)

  log.prefix = 'baz'
  log.status('')
  t.true(log.dirty)

  log.prefix = ''
  log.status('')
  t.false(log.dirty)
})
