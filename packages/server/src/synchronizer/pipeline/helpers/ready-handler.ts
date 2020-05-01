import {through} from '../../streams'

/**
 * Ready handler is used to close the promise and will run when
 * The input stream does not have input for a set time
 * This is asssumed to happen only during watch mode.
 * Note the ready event will continually fire if the threshold is not met
 */
const readyHandler = (handler: Function) => {
  let timeout: number

  function resetTimeout() {
    destroyTimeout()
    timeout = setTimeout(handler, 500)
  }

  function destroyTimeout() {
    clearTimeout(timeout)
  }

  const stream = through({objectMode: true}, function (f, _, next) {
    resetTimeout()
    next(null, f)
  })

  stream.on('end', () => {
    destroyTimeout()
    handler()
  })

  return {stream}
}

export default readyHandler
