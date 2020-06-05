import {resolve} from 'path'
import {move, remove, pathExists} from 'fs-extra'
import {ServerConfig, normalize} from './config'
import {nextBuild} from './next-utils'
import {saveBuild} from './build-hash'
import {configureStages} from './stages'

export async function build(config: ServerConfig, readyForNextBuild: Promise<any> = Promise.resolve()) {
  const {
    rootFolder,
    transformFiles,
    buildFolder,
    nextBin,
    ignore,
    include,
    watch,
    ...stageConfig
  } = await normalize(config)

  const src = rootFolder
  const stages = configureStages(stageConfig)
  const dest = buildFolder
  const options = {
    ignore,
    include,
    watch,
  }
  await Promise.all([transformFiles(src, stages, dest, options), readyForNextBuild])

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
