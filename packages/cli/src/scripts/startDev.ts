import {resolve, dirname} from 'path'
import {spawn} from 'child_process'
import {ensureDir, copy, unlink} from 'fs-extra'
import {watch} from 'chokidar'

export async function startDev(paths: {root: string}) {
  const srcRoot = resolve(paths.root)
  const destRoot = resolve(paths.root, '.blitz')
  await synchronizeNextJsFiles(srcRoot, destRoot)
}

async function synchronizeNextJsFiles(srcRoot: string, destRoot: string) {
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
  const removeHandler = createRemoveHandler(destRoot)

  watch(watchPaths, {ignored})
    .on('change', copyHandler)
    .on('add', copyHandler)
    .on('unlink', removeHandler)
    .on('ready', () => {
      startNext({root: destRoot})
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

const createRemoveHandler = (fileRoot: string) => async (path: string) => {
  const filePath = resolve(fileRoot, path)
  await unlink(filePath)
  reporter.remove(fileRoot, filePath)
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

// TODO: Eventually use a proper reporting mechanism
const reporter = {
  copy(fileRoot: string, srcPath: string, destPath: string) {
    console.log(`${resolve(fileRoot, srcPath)} => ${resolve(srcPath, destPath)}`)
  },

  remove(fileRoot: string, filePath: string) {
    console.log(`DELETE: ${resolve(fileRoot, filePath)}`)
  },
}

// Rules list
export function noopPathTransform(path: string) {
  return path
}
