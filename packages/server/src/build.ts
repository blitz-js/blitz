import {resolve} from 'path'
import {synchronizeFiles} from '@blitzjs/synchronizer'
import {move, remove, pathExists} from 'fs-extra'
import {ServerConfig, enhance} from './config'
import {nextBuild} from './next-utils'
import {saveBuild} from './build-hash'
import {configureRules} from './rules'
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
  const rules = configureRules({writeManifestFile})
  await synchronizeFiles(rootFolder, rules, buildFolder, {
    ignore,
    include,
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
