import {resolve} from "path"
import {ServerConfig, normalize} from "./config"
import {nextStartDev} from "./next-utils"
import {configureStages} from "./stages"

export async function dev(
  {watch = true, ...config}: ServerConfig,
  readyForNextDev: Promise<any> = Promise.resolve(),
) {
  const {
    //
    rootFolder,
    transformFiles,
    nextBin,
    devFolder,
    ignore,
    include,
    isTypescript,
    ...stagesConfig
  } = await normalize({
    ...config,
    interceptNextErrors: true,
  })

  const src = resolve(rootFolder)
  const stages = configureStages(stagesConfig)
  const dest = resolve(rootFolder, devFolder)
  const options = {
    ignore,
    include,
    watch,
    isTypescript,
  }

  const [{manifest}] = await Promise.all([
    transformFiles(src, stages, dest, options),
    // Ensure next does not start until parallel processing completes
    readyForNextDev,
  ])

  await nextStartDev(nextBin, dest, manifest, devFolder, config)
}
