import {build} from "./build"
import {alreadyBuilt} from "./build-hash"
import {normalize, ServerConfig} from "./config"
import {nextStart} from "./next-utils"

export async function prod(config: ServerConfig) {
  const {buildFolder, nextBin} = await normalize(config)
  if (!(await alreadyBuilt(buildFolder))) {
    await build(config)
  }
  await nextStart(nextBin, buildFolder, config)
}
