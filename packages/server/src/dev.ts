import {resolve} from 'path'
import {synchronizeFiles as defaultSynchronizer} from '@blitzjs/synchronizer'
import {ServerConfig, enhance} from './config'
import {nextStartDev} from './next-utils'
import {rules} from './rules'
export async function dev(config: ServerConfig, readyForNextDev: Promise<any> = Promise.resolve()) {
  const {
    rootFolder,
    nextBin,
    devFolder,
    ignoredPaths,
    manifestPath,
    writeManifestFile,
    includePaths,
    synchronizer: synchronizeFiles = defaultSynchronizer,
    watch = true,
  } = await enhance({
    ...config,
    interceptNextErrors: true,
  })
  const src = resolve(rootFolder)
  const dest = resolve(rootFolder, devFolder)

  const [{manifest}] = await Promise.all([
    synchronizeFiles({
      rules,
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

  await nextStartDev(nextBin, dest, manifest, devFolder, config)
}
