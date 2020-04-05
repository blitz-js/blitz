import {ServerConfig, enhance} from './config'
import {nextStart} from './next-utils'
import {build} from './build'

export async function prod(config: ServerConfig) {
  const {rootFolder, nextBin} = enhance(config)
  await build(config)
  await nextStart(nextBin, rootFolder)
}
