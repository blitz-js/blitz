import {FSWatcher} from 'chokidar'
import fg from 'fast-glob'
import gulpIf from 'gulp-if'
import {pipeline, Readable} from 'readable-stream'
import File from 'vinyl'
import {dest} from 'vinyl-fs'
import {ciLog} from '../ciLog'
import {createManifestFile, Manifest, setManifestEntry} from './manifest'
import rulesDecorator from './rules'
import {countStream} from './count-stream'
import {unlink} from './unlink'
import {clean} from './clean'
import {watch} from './watch'

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
  watcher: FSWatcher
  stream: Readable
  manifest: Manifest
}

// TODO: handle files possibly corrupted out of sync
//  * how can I know that an entry is out of sync?
//   1. add stat info modified date in the manifest
//   2. stat the entry for modified date ahead of time
//   3. if the dates are different then the entry is invalid and should be waited on

export async function synchronizeFiles({
  dest: destPath,
  src: srcPath,
  includePaths,
  ignoredPaths,
  manifestPath,
  writeManifestFile,
  ...opts
}: SynchronizeFilesInput): Promise<SynchronizeFilesOutput> {
  const options = {
    ignored: ignoredPaths,
    persistent: opts.watch,
    ignoreInitial: false,
    cwd: srcPath,
  }

  const manifest = Manifest.create()
  const entries = fg.sync(includePaths, {ignore: options.ignored, cwd: options.cwd})
  const {stream, watcher} = watch(includePaths, options)

  // TODO:  This always cleans we should workout how
  //        to avoid blowing everything away
  await clean(destPath)

  return await new Promise((resolve, reject) => {
    const errorHandler = (err: any) => err && reject(err)
    const rulesConfig = {srcPath, destPath, errorHandler}
    const decoratedStream = rulesDecorator(rulesConfig)(stream)

    pipeline(
      // Run compilation rules
      decoratedStream,

      // File sync
      gulpIf(isUnlinkFile, unlink(destPath), dest(destPath)),

      // Maintain build manifest
      setManifestEntry(manifest),
      createManifestFile(manifest, manifestPath),
      gulpIf(writeManifestFile, dest(srcPath)),

      // Resolve promise upon file count matching manifest
      // TODO this will need adjustment for existing builds
      countStream((count) => {
        // TODO: How we know when a static build is finished and to return the promise needs attention
        if (count >= entries.length) {
          ciLog('Stream files have been created. Here is a manifest.', manifest.toObject())

          // Close watcher to avoid extra watching
          // when run in non watch mode
          if (!opts.watch) {
            watcher.close()
          }

          resolve({
            stream,
            watcher,
            manifest,
          })
        }
      }),
      errorHandler,
    )
  })
}

const isUnlinkFile = (file: File) => file.event === 'unlink' || file.event === 'unlinkDir'
