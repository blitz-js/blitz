import {resolve} from 'path'
import {synchronizeFiles} from './synchronizer'
import {ServerConfig, enhance} from './config'
import {nextStartDev} from './next-utils'

export async function dev(config: ServerConfig) {
  const {
    rootFolder,
    nextBin,
    devFolder,
    ignoredPaths,
    manifestPath,
    writeManifestFile,
    includePaths,
  } = enhance({
    ...config,
    interceptNextErrors: true,
  })
  const src = resolve(rootFolder)
  const dest = resolve(rootFolder, devFolder)

  const {watcher, manifest} = await synchronizeFiles({
    src,
    dest,
    watch: true,
    ignoredPaths,
    includePaths,
    manifestPath,
    writeManifestFile,
  })

  nextStartDev(nextBin, dest, manifest, devFolder)

  return watcher
}
