# log
Simple console logging

## API

Single default object `log` exported

### log
`log(text)`

Writes a line of text to the console. Cleans up if partial `log.status` lines have already been written.

Includes any `log.prefix` set.

### log.status
`log.status(text)`

Writes a line of text *without a newline*

Truncates the text to keep within `log.width` if set. Also includes any `log.prefix` set

### log.prefix
`log.prefix = 'Message: '`

Sets a prefix to prepend to each message

### log.width

Sets a width used to truncate `log.status` messages. Set automatically (and monitored) if run via a TTY

### log.[colour]

Main colours from `kleur` are attached here to add touch of glitz
