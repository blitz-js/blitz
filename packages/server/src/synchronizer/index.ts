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

export function synchronizeFiles({
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

  // TODO: manifest loaded (possibly corrupted out of sync)
  //          * how can I know that an entry is out of sync?
  //            * add stat info modified date in the manifest
  //            * stat the entry for modified date ahead of time
  //            * if the dates are different then the entry is invalid and should be waited on

  const entries = fg.sync(includePaths, {ignore: options.ignored, cwd: options.cwd})
  const manifest = Manifest.create()
  const watcher = watch(includePaths, options)

  const stream = pipeline(
    watcher.stream,
    transformPage({
      sourceFolder: srcPath,
      appFolder: 'app',
      folderName: 'pages',
    }),
    gulpIf(isUnlinkFile, unlink(destPath), dest(destPath)),
    setManifestEntry(manifest),
    createManifestFile(manifest, manifestPath),
    gulpIf(writeManifestFile, dest(srcPath)),
  )

  return new Promise(resolve => {
    // TODO: add timeout/error?
    let count = 0
    stream.on('data', () => {
      count++
      if (count === entries.length) {
        resolve({
          ...watcher,
          manifest: manifest,
        })
      }
    })
  })
}

const isUnlinkFile = (file: File) => file.event === 'unlink' || file.event === 'unlinkDir'
