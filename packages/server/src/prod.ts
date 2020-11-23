import { log } from "@blitzjs/display"
import { build } from "./build"
import { alreadyBuilt } from "./build-hash"
import { normalize, ServerConfig } from "./config"
import { loadCustomServer } from "./create-blitz-app"
import { nextStart } from "./next-utils"

export async function prod(config: ServerConfig) {
  const { buildFolder, nextBin } = await normalize(config)
  if (!(await alreadyBuilt(buildFolder))) {
    await build(config)
  }
  const customServer = await loadCustomServer(buildFolder)
  if (customServer) {
    log.success('Custom server loaded')
  } else {
    await nextStart(nextBin, buildFolder, config)
  }
}
