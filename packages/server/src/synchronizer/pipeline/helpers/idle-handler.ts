import {through} from '../../streams'
import {READY, IDLE} from '../../events'
import {Writable} from 'stream'

/**
 * Idle handler will fire events when the stream is idle
 * for a certain amount of time.
 *
 * The first time it fires it will also fire a ready event
 */
const idleHandler = (reporter: Writable) => {
  let timeout: NodeJS.Timeout
  let firstTime = true

  const handler = () => {
    if (firstTime) {
      reporter.write({type: READY})
      firstTime = false
    }

    reporter.write({type: IDLE})
  }

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

export default idleHandler
