import {through} from './streams'
import File from 'vinyl'
import {log} from '../log'

export type Event<T> = {type: string; payload: T}

export const INIT = 'INIT'
export const FILE_WRITTEN = 'FILE_WRITTEN'
export const ERROR_THROWN = 'ERROR_THROWN'
export const READY = 'READY'

/**
 * Reporter is a stream that converts build status events and prepares them for the console.
 * A good way to think about this is as the root of the "view" component of the application.
 */
export default function createReporter() {
  let lastEvent: Event<any> = {type: INIT, payload: null}

  const stream = through({objectMode: true}, (event: Event<File>, _, next) => {
    switch (event.type) {
      case FILE_WRITTEN: {
        const filePath = event.payload.history[0].replace(process.cwd(), '')
        log.clearLine(filePath)
        setTimeout(log.clearLine, 100)
        break
      }

      case ERROR_THROWN: {
        // Tidy up if operational error is encountered
        if (lastEvent.type === FILE_WRITTEN) {
          log.clearLine()
        }
        break
      }

      case READY: {
        if (lastEvent.type === FILE_WRITTEN) {
          log.clearLine()
        }
        log.success('Blitz is ready')
        break
      }
    }

    // Capture last event incase we need to tidy up the console
    lastEvent = event

    next()
  })

  return {stream}
}
