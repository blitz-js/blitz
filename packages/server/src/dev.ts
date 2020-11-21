import {normalize, ServerConfig} from "./config"
import {nextStartDev} from "./next-utils"
import {configureStages} from "./stages"

export async function dev(config: ServerConfig) {
  const {
    rootFolder,
    transformFiles,
    nextBin,
    devFolder,
    ignore,
    include,
    isTypescript,
    writeManifestFile,
    watch,
    clean,
  } = await normalize({...config, env: "dev"})

  const stages = configureStages({writeManifestFile, isTypescript})

  const {manifest} = await transformFiles(rootFolder, stages, devFolder, {
    ignore,
    include,
    watch,
    clean,
  })

  await nextStartDev(nextBin, devFolder, manifest, devFolder, config)
}
