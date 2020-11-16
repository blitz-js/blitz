import {normalize, ServerConfig} from "./config"
import {configureRouteStages} from "./stages"

export async function routes(
  config: ServerConfig,
  //   readyForNextDev: Promise<any> = Promise.resolve(),
) {
  const {
    rootFolder,
    transformFiles,
    // nextBin,
    devFolder,
    ignore,
    include,
    isTypescript,
    writeManifestFile,
    // watch,
    clean,
  } = await normalize({...config, env: "dev"})

  const stages = configureRouteStages({writeManifestFile, isTypescript})

  const {routes} = await transformFiles(rootFolder, stages, devFolder, {
    ignore,
    include,
    watch: false,
    clean,
  })

  return Object.values(routes)
}
