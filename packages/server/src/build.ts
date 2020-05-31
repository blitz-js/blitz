import {resolve} from 'path'
import {move, remove, pathExists} from 'fs-extra'
import {ServerConfig, normalize} from './config'
import {nextBuild} from './next-utils'
import {saveBuild} from './build-hash'
import {configureRules} from './rules'

export async function build(config: ServerConfig) {
  const {
    rootFolder,
    transformFiles,
    buildFolder,
    nextBin,
    ignore,
    include,
    watch,
    ...rulesConfig
  } = await normalize(config)

  const src = rootFolder
  const rules = configureRules(rulesConfig)
  const dest = buildFolder
  const options = {
    ignore,
    include,
    watch,
  }

  await transformFiles(src, rules, dest, options)
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
