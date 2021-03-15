import {normalize, ServerConfig} from "./config"
import {configureGenerateStages} from "./stages"

export async function generate(config: ServerConfig) {
  const {rootFolder, routesFolder, transformFiles, ignore, include} = await normalize({
    ...config,
    env: "dev",
  })

  const stages = configureGenerateStages()

  await transformFiles(rootFolder, stages, routesFolder, {
    ignore,
    include,
    watch: false,
    clean: true,
  })
}
