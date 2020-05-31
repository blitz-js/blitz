import {through} from '../../streams'
import crypto from 'crypto'

/**
 * Returns a stage that prepares files coming into the stream
 * with correct event information as well as hash information
 * This is used by the work optimizer and elsewhere to manage the
 * way files are handled and optimized
 */
export function createEnrichFiles() {
  const stream = through({objectMode: true}, (file, _, next) => {
    // Don't send directories
    if (file.isDirectory()) {
      return next()
    }

    if (!file.event) {
      file.event = 'add'
    }

    if (!file.hash) {
      const hash = crypto
        .createHash('md5')
        .update(JSON.stringify({path: file.path, s: file.stat?.mtime}))
        .digest('hex')

      file.hash = hash
    }

    next(null, file)
  })
  return {stream}
}
