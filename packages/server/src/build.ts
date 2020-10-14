import {move, pathExists, remove} from "fs-extra"
import {resolve} from "path"
import {saveBuild} from "./build-hash"
import {normalize, ServerConfig} from "./config"
import {nextBuild} from "./next-utils"
import {configureStages} from "./stages"

const replace = async (src: string, dest: string) => {
  if (await pathExists(dest)) {
    await remove(dest)
  }

  if (await pathExists(src)) {
    await move(src, dest)
  }
}

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
      clean: true, // always clean in build
    }),
    readyForNextBuild,
  ])

  await nextBuild(nextBin, buildFolder)

  const rootNextFolder = resolve(rootFolder, ".next")
  const buildNextFolder = resolve(buildFolder, ".next")
  await replace(buildNextFolder, rootNextFolder)

  // Ensure that the `blitz.config.js` file exists in the root as `_blitz.config.js`
  const buildConfig = resolve(buildFolder, "blitz.config.js")
  const rootConfig = resolve(rootFolder, "_blitz.config.js")
  await replace(buildConfig, rootConfig)

  await saveBuild(buildFolder)
}
