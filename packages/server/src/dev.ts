import {normalize, ServerConfig} from "./config"
import {nextStartDev} from "./next-utils"
import {configureStages} from "./stages"

export async function dev(config: ServerConfig, readyForNextDev: Promise<any> = Promise.resolve()) {
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

  const [{manifest}] = await Promise.all([
    transformFiles(rootFolder, stages, devFolder, {
      ignore,
      include,
      watch,
      clean,
    }),
    // Ensure next does not start until parallel processing completes
    readyForNextDev,
  ])

  await nextStartDev(nextBin, devFolder, manifest, devFolder, config)
}
