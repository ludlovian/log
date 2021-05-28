# log
Simple console logging

## API

Single default object `log` exported

### log
`log(text)`

Writes a line of text to the console. Cleans up if partial `log.status` lines have already been written.

### log.status
`log.status(text)`

Writes a line of text *without a newline*

Truncates the text to keep within console width (if set)

### log.prefix
`logger = log.prefix('abc')`

Creates a logger which has a prefix prepended to each message. You can chain these.

### log.colour
`logger = log.colour('red')`

Creates a logger with preset colours. The colour functions are also available as `log.red` etc.

If you don't specify a colour, the logger will be assigned a random one.

### log.level
`logger = log.level(3).colour('blue').prefix('TRACE: ')`

Creates a logger which only logs if the level is that set to that level or above.

Leve is set by LOGLEVEL env var, or by `_state.level`

### _state

Internal gubbins
