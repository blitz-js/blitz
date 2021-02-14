import {log} from "@blitzjs/display"
import {normalize, ServerConfig} from "./config"
import {customServerExists, nextStart, startCustomServer} from "./next-utils"

export async function prod(config: ServerConfig) {
  const {buildFolder, nextBin} = await normalize(config)

  if (customServerExists(buildFolder)) {
    log.success("Using your custom server")
    await startCustomServer(buildFolder, config)
  } else {
    await nextStart(nextBin, buildFolder, config)
  }
}
