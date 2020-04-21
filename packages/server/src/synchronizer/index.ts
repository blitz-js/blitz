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
import configRule, {copyConfig} from './rules/config'
import {ciLog} from '../ciLog'
import {runRule} from './rules-runner'
import through from 'through2'
import {checkDuplicateRoutes} from './check-duplicate-routes'
import {checkNestedApi} from './check-nested-api'

type SynchronizeFilesInput = {
  src: string
  dest: string
  watch: boolean
  manifestPath: string
  ignoredPaths: string[]
  includePaths: string[]
  writeManifestFile: boolean
  serverless?: boolean
}

type SynchronizeFilesOutput = {
  watcher: FSWatcher
  stream: Readable
  manifest: Manifest
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

  // HACK: we can get a faster build
  // more paralellism and memory efficiency if we
  // stream entry files and collect in an analysis phase
  // instead of sequential async functions
  const entries = fg.sync(includePaths, {ignore: options.ignored, cwd: options.cwd})

  checkNestedApi(entries)
  checkDuplicateRoutes(entries)

  // HACK: cleaning the dev folder on every restart means we do more work than necessary
  // TODO: remove this clean and devise a way to resolve differences in stream
  await clean(destPath)

  await copyConfig(entries, srcPath, destPath)

  const manifest = Manifest.create()
  const {stream, watcher} = watch(includePaths, options)

  return await new Promise((resolve, reject) => {
    pipeline(
      stream,

      // Rules
      runRule(pagesFolder({srcPath})),
      runRule(rpc({srcPath, serverless: opts.serverless})),
      runRule(configRule()),

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
