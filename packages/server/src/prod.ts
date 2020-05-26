import {ServerConfig, enhance} from './config'
import {nextStart} from './next-utils'
import {build} from './build'
import {alreadyBuilt} from './build-hash'

export async function prod(config: ServerConfig) {
  const {rootFolder, nextBin} = await enhance(config)
  if (!(await alreadyBuilt(await enhance(config)))) {
    await build(config)
  }

  await nextStart(nextBin, rootFolder, config)
}
