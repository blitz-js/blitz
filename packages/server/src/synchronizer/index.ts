import {Manifest} from './pipeline/rules/manifest'
import {pipe} from './streams'
import {createPipeline} from './pipeline'
import {agnosticSource} from './pipeline/helpers/agnostic-source'
import {pathExists, ensureDir, remove} from 'fs-extra'
import {through} from './streams'
import {createDisplay} from './display'
import {createErrorsStream} from './errors'
import {READY} from './events'

type SynchronizeFilesInput = {
  src: string
  dest: string
  watch: boolean
  isTsProject: boolean
  manifestPath: string
  ignoredPaths: string[]
  includePaths: string[]
  writeManifestFile: boolean
}

type SynchronizeFilesOutput = {
  manifest: Manifest
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
  watch,
  includePaths: include,
  ignoredPaths: ignore,
  writeManifestFile,
  isTsProject,
}: SynchronizeFilesInput): Promise<SynchronizeFilesOutput> {
  // HACK: cleaning the dev folder on every restart means we do more work than necessary
  // TODO: remove this clean and devise a way to resolve differences in stream
  await clean(dest)

  const reporter = {
    stream: through({objectMode: true}, (event, __, next) => {
      next(null, event)
    }),
  }

  const errors = createErrorsStream(reporter.stream)
  const display = createDisplay()
  return new Promise((resolve, reject) => {
    const config = {
      cwd: src,
      src: src,
      dest: dest,
      isTsProject,
      manifest: {
        path: manifestPath,
        write: writeManifestFile,
      },
    }

    reporter.stream.on('data', ({type}) => {
      if (type === READY) {
        resolve({
          manifest: fileTransformer.manifest,
        })
      }
    })

    const catchErrors = (err: any) => {
      if (err) reject(err)
    }

    const source = agnosticSource({cwd: src, include, ignore, watch})
    const fileTransformer = createPipeline(config, errors.stream, reporter.stream)

    // Send source to fileTransformer
    pipe(source.stream, fileTransformer.stream, catchErrors)

    // Send reporter events to display
    pipe(reporter.stream, display.stream, catchErrors)
  })
}

async function clean(path: string) {
  if (await pathExists(path)) {
    await remove(path)
  }
  return await ensureDir(path)
}
