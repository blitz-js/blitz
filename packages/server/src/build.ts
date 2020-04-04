import {resolve} from 'path'
import {synchronizeFiles} from './synchronizer'
import {move, remove, pathExists} from 'fs-extra'
import {ServerConfig, enhance} from './config'
import {nextBuild} from './next-utils'

export async function build(config: ServerConfig) {
  const {
    rootFolder,
    buildFolder,
    nextBin,
    ignoredPaths,
    manifestPath,
    writeManifestFile,
    includePaths,
  } = enhance(config)

  const synchronizer = await synchronizeFiles({
    src: rootFolder,
    dest: buildFolder,
    watch: false,
    manifestPath,
    writeManifestFile,
    ignoredPaths,
    includePaths,
  })

  synchronizer.watcher.close()

  await nextBuild(nextBin, buildFolder)

  const rootNextFolder = resolve(rootFolder, '.next')
  const buildNextFolder = resolve(buildFolder, '.next')

  if (await pathExists(rootNextFolder)) {
    await remove(rootNextFolder)
  }

  if (await pathExists(buildNextFolder)) {
    await move(buildNextFolder, rootNextFolder)
  }
}
