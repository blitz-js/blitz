import {resolve} from 'path'
import {synchronizeFiles} from './synchronizer'
import {ServerConfig, enhance} from './config'
import {nextStartDev} from './next-utils'

export async function dev(config: ServerConfig, readyForNextDev: Promise<any>) {
  const {
    rootFolder,
    nextBin,
    devFolder,
    ignoredPaths,
    manifestPath,
    writeManifestFile,
    includePaths,
    watch = true,
  } = await enhance({
    ...config,
    interceptNextErrors: true,
  })
  const src = resolve(rootFolder)
  const dest = resolve(rootFolder, devFolder)

  const [{manifest}] = await Promise.all([
    synchronizeFiles({
      src,
      dest,
      watch,
      ignoredPaths,
      includePaths,
      manifestPath,
      writeManifestFile,
    }),
    readyForNextDev,
  ])

  nextStartDev(nextBin, dest, manifest, devFolder)
}
