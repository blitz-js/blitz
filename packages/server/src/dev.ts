import {resolve} from 'path'
import {synchronizeFiles} from './synchronizer'
import {ServerConfig, enhance} from './config'
import {nextStartDev} from './next-utils'

export async function dev(config: ServerConfig) {
  const {rootFolder, nextBin, devFolder, ignoredPaths, includePaths} = enhance({
    ...config,
    interceptNextErrors: true,
  })
  const src = resolve(rootFolder)
  const dest = resolve(rootFolder, devFolder)

  const fileWatcher = await synchronizeFiles({
    src,
    dest,
    watch: true,
    ignoredPaths,
    includePaths,
  })

  nextStartDev(nextBin, dest)

  return fileWatcher
}
