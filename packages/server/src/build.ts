import {resolve} from 'path'
import {synchronizeFiles} from '@blitzjs/synchronizer'
import {move, remove, pathExists} from 'fs-extra'
import {ServerConfig, enhance} from './config'
import {nextBuild} from './next-utils'
import {saveBuild} from './build-hash'
import {rules} from './rules'
export async function build(config: ServerConfig) {
  const {
    rootFolder,
    buildFolder,
    nextBin,
    ignoredPaths: ignore,
    writeManifestFile,
    includePaths: include,
    watch = false,
  } = await enhance(config)

  await synchronizeFiles({
    dest: buildFolder,
    ignore,
    include,
    rules: rules({writeManifestFile}),
    src: rootFolder,
    watch,
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
