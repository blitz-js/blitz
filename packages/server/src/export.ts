import {normalize, ServerConfig} from "./config"
import {nextExport} from "./next-utils"

export async function blitzExport(config: ServerConfig) {
  const {nextBin} = await normalize(config)
  await nextExport(nextBin, config)
}
