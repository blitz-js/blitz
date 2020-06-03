import {ServerConfig, normalize} from './config'
import {nextStart} from './next-utils'
import {build} from './build'
import {alreadyBuilt} from './build-hash'

export async function prod(config: ServerConfig) {
  const {rootFolder, buildFolder, nextBin} = await normalize(config)
  if (!(await alreadyBuilt(buildFolder))) {
    await build(config)
  }

  await nextStart(nextBin, rootFolder, config)
}
