import {Manifest} from './pipeline/rules/manifest'
import {pipe} from './streams'
import createPipeline from './pipeline'
import agnosticSource from './pipeline/helpers/agnostic-source'
import {pathExists, ensureDir, remove} from 'fs-extra'
import createReporter, {READY, IDLE} from './reporter'
import createErrors from './errors'

type SynchronizeFilesInput = {
  src: string
  dest: string
  watch: boolean
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
}: SynchronizeFilesInput): Promise<SynchronizeFilesOutput> {
  // HACK: cleaning the dev folder on every restart means we do more work than necessary
  // TODO: remove this clean and devise a way to resolve differences in stream
  await clean(dest)

  const reporter = createReporter()
  const errors = createErrors(reporter.stream)

  return new Promise((resolve, reject) => {
    const config = {
      cwd: src,
      src: src,
      dest: dest,
      manifest: {
        path: manifestPath,
        write: writeManifestFile,
      },
    }

    const readyHandler = () => {
      reporter.stream.write({type: IDLE, payload: null})
      reporter.stream.write({type: READY, payload: null})
      resolve({
        manifest: fileTransformPipeline.manifest,
      })
    }

    const catchErrors = (err: any) => {
      if (err) reject(err)
    }

    const source = agnosticSource({cwd: src, include, ignore, watch})
    const fileTransformPipeline = createPipeline(config, readyHandler, errors.stream, reporter.stream)

    pipe(source.stream, fileTransformPipeline.stream, catchErrors)
  })
}

async function clean(path: string) {
  if (await pathExists(path)) {
    await remove(path)
  }
  return await ensureDir(path)
}
