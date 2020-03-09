import {resolve} from 'path'
import {synchronizeFiles} from './synchronizer'
import {move, unlink, pathExists} from 'fs-extra'
import {Config, enhance} from './config'
import {nextBuild} from './next-utils'

export async function build(config: Config) {
  const {rootFolder, buildFolder, nextBin} = enhance(config)

  await synchronizeFiles({
    src: rootFolder,
    dest: buildFolder,
    watch: false,
  })

  await nextBuild(nextBin, buildFolder)

  const rootNextFolder = resolve(rootFolder, '.next')
  const buildNextFolder = resolve(buildFolder, '.next')
  if (await pathExists(rootNextFolder)) await unlink(rootNextFolder)
  await move(buildNextFolder, rootNextFolder)
}
