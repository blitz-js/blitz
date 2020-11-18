import {build} from "./build"
import {alreadyBuilt} from "./build-hash"
import {normalize, ServerConfig} from "./config"
import {nextStart} from "./next-utils"

export async function prod(
  config: ServerConfig,
  readyForNextProd: Promise<any> = Promise.resolve(),
) {
  const {buildFolder, nextBin} = await normalize(config)
  if (!(await alreadyBuilt(buildFolder))) {
    await build(config, readyForNextProd)
  }
  await nextStart(nextBin, buildFolder, config)
}
