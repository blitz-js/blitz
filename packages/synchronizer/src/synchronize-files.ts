import {pipe} from './streams'
import {createPipeline} from './pipeline'
import {pathExists, ensureDir, remove} from 'fs-extra'
import {through} from './streams'
import {createDisplay} from './display'
import {READY, ERROR_THROWN} from './events'
import {Rule} from './types'
import {Transform} from 'stream'

type SynchronizeFilesOptions = {
  ignore?: string[]
  include?: string[]
  watch?: boolean
  bus?: Transform
}

const defaultBus = through({objectMode: true}, (event, __, next) => {
  next(null, event)
})

/**
 * Assembles a file stranform pipeline to convert blitz source code to something that
 * can run in NextJS.
 * @param config Configuration object
 */
export async function synchronizeFiles(
  src: string,
  rules: Rule[],
  dest: string,
  options: SynchronizeFilesOptions,
): Promise<any> {
  const {
    // default options
    ignore = [],
    include = [],
    watch = false,
    bus = defaultBus,
  } = options

  // HACK: cleaning the dev folder on every restart means we do more work than necessary
  // TODO: remove this clean and devise a way to resolve differences in stream
  await clean(dest)

  // const errors = createErrorsStream(reporter.stream)
  const display = createDisplay()
  return new Promise((resolve, reject) => {
    const config = {
      cwd: src,
      src,
      dest,
      include,
      ignore,
      watch,
    }

    bus.on('data', ({type}) => {
      if (type === READY) {
        resolve(fileTransformer.ready)
      }
    })

    const fileTransformer = createPipeline(config, rules, bus)

    // Send source to fileTransformer
    fileTransformer.stream.on('error', (err) => {
      bus.write({type: ERROR_THROWN, payload: err})
      if (err) reject(err)
    })

    // Send reporter events to display
    pipe(bus, display.stream, (err) => {
      if (err) reject(err)
    })
  })
}

async function clean(path: string) {
  if (await pathExists(path)) {
    await remove(path)
  }
  return await ensureDir(path)
}
