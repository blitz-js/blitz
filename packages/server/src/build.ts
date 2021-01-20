import {copy, pathExists, remove} from "fs-extra"
import {resolve} from "path"
import {normalize, ServerConfig} from "./config"
import {nextBuild} from "./next-utils"
import {configureStages} from "./stages"

export async function build(config: ServerConfig) {
  const {
    rootFolder,
    transformFiles,
    buildFolder,
    nextBin,
    ignore,
    include,
    watch,
    isTypeScript,
    writeManifestFile,
  } = await normalize(config)

  const stages = configureStages({isTypeScript, writeManifestFile})

  await transformFiles(rootFolder, stages, buildFolder, {
    ignore,
    include,
    watch,
    clean: true, // always clean in build
  })

  await nextBuild(nextBin, buildFolder)

  const rootNextFolder = resolve(rootFolder, ".next")
  const buildNextFolder = resolve(buildFolder, ".next")

  if (await pathExists(rootNextFolder)) {
    await remove(rootNextFolder)
  }

  if (await pathExists(buildNextFolder)) {
    await copy(buildNextFolder, rootNextFolder)
  }
}
