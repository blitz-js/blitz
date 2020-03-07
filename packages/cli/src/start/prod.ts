import {Config, enhance} from './config'
import {nextStart} from './next-utils'
import {build} from './build'

export async function prod(config: Config) {
  const {rootFolder, nextBin} = enhance(config)
  await build(config)
  await nextStart(nextBin, rootFolder)
}
