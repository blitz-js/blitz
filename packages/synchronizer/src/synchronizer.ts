import {pipe} from './streams'
import {createPipeline} from './pipeline'
import {pathExists, ensureDir, remove} from 'fs-extra'
import {through} from './streams'
import {createDisplay} from './display'
import {READY, ERROR_THROWN} from './events'
import {Rule} from './types'

type SynchronizeFilesInput = {
  src: string
  dest: string
  watch: boolean
  rules: Rule[]
  manifestPath: string
  ignoredPaths: string[]
  includePaths: string[]
  writeManifestFile: boolean
}

type SynchronizeFilesOutput = {
  manifest: any //Manifest
}

/**
 * Assembles a file stranform pipeline to convert blitz source code to something that
 * can run in NextJS.
 * @param config Configuration object
 */
export async function synchronizeFiles({
  dest,
  src,
  manifestPath,
  rules,
  watch,
  includePaths: include,
  ignoredPaths: ignore,
  writeManifestFile,
}: SynchronizeFilesInput): Promise<SynchronizeFilesOutput> {
  // HACK: cleaning the dev folder on every restart means we do more work than necessary
  // TODO: remove this clean and devise a way to resolve differences in stream
  await clean(dest)

  const reporter = {
    stream: through({objectMode: true}, (event, __, next) => {
      next(null, event)
    }),
  }

  // const errors = createErrorsStream(reporter.stream)
  const display = createDisplay()
  return new Promise((resolve, reject) => {
    const config = {
      cwd: src,
      src: src,
      dest: dest,
      include,
      ignore,
      watch,
      manifest: {
        path: manifestPath,
        write: writeManifestFile,
      },
    }

    reporter.stream.on('data', ({type}) => {
      if (type === READY) {
        resolve(fileTransformer.ready)
      }
    })

    const fileTransformer = createPipeline(config, rules, reporter.stream)

    // Send source to fileTransformer
    fileTransformer.stream.on('error', (err) => {
      reporter.stream.write({type: ERROR_THROWN, payload: err})
      if (err) reject(err)
    })

    // Send reporter events to display
    pipe(reporter.stream, display.stream, (err) => {
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
