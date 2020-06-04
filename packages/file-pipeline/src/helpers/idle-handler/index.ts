import {through} from '../../streams'
import {READY, IDLE} from '../../events'
import {Writable} from 'stream'
import {isEvent} from '../../utils'

/**
 * Idle handler will fire events when the stream is idle
 * for a certain amount of time.
 *
 * The first time it fires it will also fire a ready event
 */
export const createIdleHandler = (bus: Writable, delay: number = 500) => {
  let timeout: NodeJS.Timeout

  const handler = () => {
    bus.write({type: IDLE})
  }

  function resetTimeout() {
    destroyTimeout()
    timeout = setTimeout(handler, delay)
  }

  function destroyTimeout() {
    clearTimeout(timeout)
  }

  const stream = through({objectMode: true}, function (f, _, next) {
    if (isEvent(f) && f === 'ready') {
      bus.write({type: READY})
    }
    resetTimeout()
    next(null, f)
  })

  stream.on('end', () => {
    destroyTimeout()
    handler()
  })

  return {stream}
}
