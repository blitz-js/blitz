import {unlink} from './unlink'
import {dest} from 'vinyl-fs'
import {transformPage} from './transform-page'
import {Manifest, createManifestFile, setManifestEntry} from './manifest'
import {watch} from './watch'
import {FSWatcher} from 'chokidar'
import {Readable, pipeline} from 'readable-stream'
import gulpIf from 'gulp-if'
import File from 'vinyl'
import fg from 'fast-glob'
import {remove, pathExists, ensureDir} from 'fs-extra'
import {ciLog} from '../ciLog'

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

async function clean(path: string) {
  if (await pathExists(path)) {
    await remove(path)
  }
  return await ensureDir(path)
}

function countStream(stream: NodeJS.WritableStream, cb: (count: number) => void) {
  let count = 0
  return stream.on('data', () => {
    cb(++count)
  })
}

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

  // TODO: handle files possibly corrupted out of sync
  //          * how can I know that an entry is out of sync?
  //            * add stat info modified date in the manifest
  //            * stat the entry for modified date ahead of time
  //            * if the dates are different then the entry is invalid and should be waited on

  const entries = fg.sync(includePaths, {ignore: options.ignored, cwd: options.cwd})
  const manifest = Manifest.create()
  const {stream, watcher} = watch(includePaths, options)

  const createStream = () =>
    pipeline(
      stream,
      transformPage({
        sourceFolder: srcPath,
        appFolder: 'app',
        folderName: ['routes', 'pages'],
      }),
      gulpIf(isUnlinkFile, unlink(destPath), dest(destPath)),
      setManifestEntry(manifest),
      createManifestFile(manifest, manifestPath),
      gulpIf(writeManifestFile, dest(srcPath)),
    )

  await clean(destPath)

  return await new Promise(resolve => {
    // TODO: add timeout/error?
    countStream(createStream(), count => {
      if (count >= entries.length) {
        ciLog('Stream files have been created. Here is a manifest.', manifest.toObject())

        resolve({
          stream,
          watcher,
          manifest,
        })
      }
    })
  })
}

const isUnlinkFile = (file: File) => file.event === 'unlink' || file.event === 'unlinkDir'
