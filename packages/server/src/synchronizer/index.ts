import {unlink} from './unlink'
import {dest} from 'vinyl-fs'
import pagesFolder from './rules/pages-folder'
import rpc from './rules/rpc'
import {Manifest, createManifestFile, setManifestEntry} from './manifest'
import {watch} from './watch'
import {FSWatcher} from 'chokidar'
import {Readable, pipeline} from 'readable-stream'
import gulpIf from 'gulp-if'
import File from 'vinyl'
import fg from 'fast-glob'
import {remove, pathExists, ensureDir} from 'fs-extra'
import {ciLog} from '../ciLog'
import {runRule} from './rules-runner'
import through from 'through2'

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
//          * how can I know that an entry is out of sync?
//            * add stat info modified date in the manifest
//            * stat the entry for modified date ahead of time
//            * if the dates are different then the entry is invalid and should be waited on

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

  const entries = fg.sync(includePaths, {ignore: options.ignored, cwd: options.cwd})
  const manifest = Manifest.create()
  const {stream, watcher} = watch(includePaths, options)

  await clean(destPath)

  return await new Promise((resolve, reject) => {
    pipeline(
      stream,

      // Rules
      runRule(pagesFolder({srcPath})),
      runRule(rpc({srcPath})),

      // File sync
      gulpIf(isUnlinkFile, unlink(destPath), dest(destPath)),

      // Maintain build manifest
      setManifestEntry(manifest),
      createManifestFile(manifest, manifestPath),
      gulpIf(writeManifestFile, dest(srcPath)),
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
      (err) => {
        reject(err)
      },
    )
  })
}

const isUnlinkFile = (file: File) => file.event === 'unlink' || file.event === 'unlinkDir'

async function clean(path: string) {
  if (await pathExists(path)) {
    await remove(path)
  }
  return await ensureDir(path)
}

const countStream = (cb: (count: number) => void) => {
  let count = 0
  return through.obj((_, __, next) => {
    cb(++count)
    next()
  })
}
