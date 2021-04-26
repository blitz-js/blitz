import {rimraf} from "@blitzjs/file-pipeline"
import {copy} from "fs-extra"
import {resolve} from "path"
import {saveBlitzVersion} from "./blitz-version"
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
    env,
  } = await normalize(config)

  const {stages, overrideTriage} = await configureStages({
    isTypeScript,
    writeManifestFile,
    buildFolder,
    env,
  })

  const {manifest} = await transformFiles(rootFolder, stages, buildFolder, {
    ignore,
    include,
    watch,
    clean: true, // always clean in build
    overrideTriage,
  })

  await saveBlitzVersion(buildFolder)

  await nextBuild(nextBin, buildFolder, manifest, config)

  const rootNextFolder = resolve(rootFolder, ".next")
  const buildNextFolder = resolve(buildFolder, ".next")

  await rimraf(rootNextFolder)
  await copy(buildNextFolder, rootNextFolder)
}
