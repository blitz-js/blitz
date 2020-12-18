import {log} from "@blitzjs/display"
import * as fs from "fs"
import {normalize, ServerConfig} from "./config"
import {nextStart} from "./next-utils"

export async function prod(config: ServerConfig) {
  const {buildFolder, nextBin} = await normalize(config)
  if (!fs.existsSync(buildFolder)) {
    log.error("Build folder not found, make sure to run `blitz build` before starting")
    process.exit(1)
  }
  await nextStart(nextBin, buildFolder, config)
}
