import {log} from "@blitzjs/display"
import * as fs from "fs"
import {normalize, ServerConfig} from "./config"
import {customServerExists, nextStart, startCustomServer} from "./next-utils"

export async function prod(config: ServerConfig) {
  const {buildFolder, nextBin} = await normalize(config)
  if (!fs.existsSync(buildFolder)) {
    log.error("Could not find a production build, you must run `blitz build` before starting")
    process.exit(1)
  }

  if (customServerExists()) {
    log.success("Using your custom server")
    await startCustomServer(buildFolder, config)
  } else {
    await nextStart(nextBin, buildFolder, config)
  }
}
