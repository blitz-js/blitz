import {resolve} from 'path'
import {synchronizeFiles} from './synchronizer'
import {move, remove, pathExists} from 'fs-extra'
import {ServerConfig, enhance} from './config'
import {nextBuild} from './next-utils'

export async function build(config: ServerConfig) {
  const {rootFolder, buildFolder, nextBin, ignoredPaths, includePaths} = enhance(config)

  await synchronizeFiles({
    src: rootFolder,
    dest: buildFolder,
    watch: false,
    ignoredPaths,
    includePaths,
  })

  await nextBuild(nextBin, buildFolder)

  const rootNextFolder = resolve(rootFolder, '.next')
  const buildNextFolder = resolve(buildFolder, '.next')
  if (await pathExists(rootNextFolder)) await remove(rootNextFolder)
  await move(buildNextFolder, rootNextFolder)
}
