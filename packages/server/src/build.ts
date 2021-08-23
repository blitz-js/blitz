import {normalize, ServerConfig} from "./config"
import {buildCustomServer, customServerExists, nextBuild} from "./next-utils"

export async function build(config: ServerConfig) {
  const {rootFolder, nextBin, watch} = await normalize(config)

  await nextBuild(nextBin, rootFolder, {} as any, config)
  if (customServerExists()) await buildCustomServer({watch})
}
