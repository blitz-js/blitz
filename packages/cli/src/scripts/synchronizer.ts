import {resolve, relative, dirname} from 'path'
import {ensureDir, copy, unlink} from 'fs-extra'
import {watch, FSWatcher} from 'chokidar'
import {reporter} from './reporter'

type SynchronizeFilesArgs = {
  src: string
  dest: string
  watch: boolean
}
export async function synchronizeFiles(opts: SynchronizeFilesArgs) {
  const {dest, src} = opts
  await ensureDir(dest)

  const watchPaths = ['**/*']
  const ignored = [
    './build',
    '.blitz',
    '.DS_Store',
    '.git',
    '.next',
    '*.log',
    '.now',
    '*.pnp.js',
    '/coverage',
    '/dist',
    'node_modules',
  ]

  const copyHandler = createCopyHandler(src, dest)
  const removeHandler = createRemoveHandler(src, dest)

  const watchConfig = {
    ignored,
    persistent: opts.watch,
    cwd: src,
  }

  return new Promise<FSWatcher>(res => {
    const watcher = watch(watchPaths, watchConfig)
      .on('change', copyHandler)
      .on('add', copyHandler)
      .on('unlink', removeHandler)
      .on('ready', () => {
        res(watcher)
      })
  })
}

const createCopyHandler = (srcRoot: string, destRoot: string) => async (path: string) => {
  const srcPath = resolve(srcRoot, path)
  const destPath = resolve(
    destRoot,
    // Eventually we can set up a pipe and
    // have a list of cascading fns
    noopPathTransform(path),
  )

  reporter.copy(srcRoot, srcPath, destPath)

  await ensureDir(dirname(destPath))
  await copy(srcPath, destPath, {dereference: true})
}

const createRemoveHandler = (srcRoot: string, destRoot: string) => async (path: string) => {
  const relativePath = relative(srcRoot, path)
  const filePath = resolve(destRoot, relativePath)
  await unlink(filePath)
  reporter.remove(destRoot, filePath)
}

// Rules list
export function noopPathTransform(path: string) {
  return path
}
