import {resolve} from 'path'
import {synchronizeFiles} from './synchronizer'
import {move, remove, pathExists} from 'fs-extra'
import {ServerConfig, enhance} from './config'
import {nextBuild} from './next-utils'
import {saveBuild} from './build-hash'

export async function build(config: ServerConfig) {
  const {
    rootFolder,
    buildFolder,
    nextBin,
    ignoredPaths,
    manifestPath,
    writeManifestFile,
    includePaths,
    watch = false,
  } = await enhance(config)

  await synchronizeFiles({
    src: rootFolder,
    dest: buildFolder,
    watch,
    manifestPath,
    writeManifestFile,
    ignoredPaths,
    includePaths,
  })

  await nextBuild(nextBin, buildFolder)

  const rootNextFolder = resolve(rootFolder, '.next')
  const buildNextFolder = resolve(buildFolder, '.next')

  if (await pathExists(rootNextFolder)) {
    await remove(rootNextFolder)
  }

  if (await pathExists(buildNextFolder)) {
    await move(buildNextFolder, rootNextFolder)
  }

  await saveBuild(buildFolder)
}
