import {resolve, relative, dirname} from 'path'
import {spawn} from 'child_process'
import {ensureDir, copy, unlink} from 'fs-extra'
import {watch, FSWatcher} from 'chokidar'
import {reporter} from './reporter'

type StartConfig = {root: string; persistent?: boolean}
export async function dev({root, persistent = true}: StartConfig): Promise<FSWatcher> {
  const srcRoot = resolve(root)
  const destRoot = resolve(root, '.blitz')
  return await synchronizeNextJsFiles(srcRoot, destRoot, persistent)
}

async function synchronizeNextJsFiles(srcRoot: string, destRoot: string, persistent: boolean) {
  await ensureDir(destRoot)

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

  const copyHandler = createCopyHandler(srcRoot, destRoot)
  const removeHandler = createRemoveHandler(srcRoot, destRoot)

  const watchConfig = {
    ignored,
    persistent,
    cwd: srcRoot,
  }

  return new Promise<FSWatcher>(res => {
    const watcher = watch(watchPaths, watchConfig)
      .on('change', copyHandler)
      .on('add', copyHandler)
      .on('unlink', removeHandler)
      .on('ready', () => {
        startNext({root: destRoot})
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

function startNext(opts: {root: string}) {
  // As node_modules is from the outer source folder
  // we need to reference the bin from there
  spawn('../node_modules/.bin/next', ['dev'], {
    cwd: opts.root,
    stdio: 'inherit',
  }).on('close', function() {
    process.exit(0)
  })
}

// Rules list
export function noopPathTransform(path: string) {
  return path
}
