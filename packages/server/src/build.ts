import {move, pathExists, remove} from "fs-extra"
import {resolve} from "path"
import {saveBuild} from "./build-hash"
import {normalize, ServerConfig} from "./config"
import {nextBuild} from "./next-utils"
import {configureStages} from "./stages"

export async function build(
  config: ServerConfig,
  readyForNextBuild: Promise<any> = Promise.resolve(),
) {
  const {
    rootFolder,
    transformFiles,
    buildFolder,
    nextBin,
    ignore,
    include,
    watch,
    isTypescript,
    writeManifestFile,
  } = await normalize(config)

  const stages = configureStages({isTypescript, writeManifestFile})

  await Promise.all([
    transformFiles(rootFolder, stages, buildFolder, {
      ignore,
      include,
      watch,
    }),
    readyForNextBuild,
  ])

  await nextBuild(nextBin, buildFolder)

  const rootNextFolder = resolve(rootFolder, ".next")
  const buildNextFolder = resolve(buildFolder, ".next")

  if (await pathExists(rootNextFolder)) {
    await remove(rootNextFolder)
  }

  if (await pathExists(buildNextFolder)) {
    await move(buildNextFolder, rootNextFolder)
  }

  await saveBuild(buildFolder)
}
