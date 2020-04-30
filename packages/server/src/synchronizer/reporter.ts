import {through} from './streams'
import File from 'vinyl'
import {log} from '../log'
import chalk from 'chalk'
import {Event, FILE_WRITTEN, INIT, ERROR_THROWN, READY} from './events'

/**
 * Reporter is a stream that converts build status events and prepares them for the console.
 * A good way to think about this is as the root of the "view" component of the application.
 */
export default function createReporter() {
  let lastEvent: Event<any> = {type: INIT, payload: null}

  let spinner = log.spinner('Preparing for launch').start()

  const stream = through({objectMode: true}, (event: Event<File>, _, next) => {
    switch (event.type) {
      case FILE_WRITTEN: {
        const filePath = event.payload.history[0].replace(process.cwd(), '')
        spinner.text = filePath
        break
      }

      case ERROR_THROWN: {
        // Tidy up if operational error is encountered
        if (lastEvent.type === FILE_WRITTEN) {
          spinner.fail('Uh oh something broke')
        }
        break
      }

      case READY: {
        spinner.succeed(chalk.green.bold('Prepped for launch'))
        break
      }
    }

    // Capture last event incase we need to tidy up the console
    lastEvent = event

    next()
  })

  return {stream}
}
