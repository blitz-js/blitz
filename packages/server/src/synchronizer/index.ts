import watch from 'gulp-watch'

import {dest} from './dest'
import vfs from 'vinyl-fs'
import {transformPage} from './transformPage'
import {Manifest, toManifestFile} from './Manifest'

type SynchronizeFilesArgs = {
  src: string
  dest: string
  watch: boolean
  ignoredPaths: string[]
  includePaths: string[]
}
export function synchronizeFiles({
  dest: destPath,
  src: srcPath,
  includePaths,
  ignoredPaths,
  ...opts
}: SynchronizeFilesArgs) {
  const options = {
    ignored: ignoredPaths,
    persistent: opts.watch,
    ignoreInitial: false,
    cwd: srcPath,
  }

  const manifest = Manifest.create()

  watch(includePaths, options)
    .pipe(
      transformPage({
        sourceFolder: srcPath,
        appFolder: 'app',
        folderName: 'pages',
      }),
    )
    .pipe(dest(destPath))
    .pipe(toManifestFile(manifest, '_index.json'))
    .pipe(vfs.dest(destPath))
}
