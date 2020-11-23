import { log } from "@blitzjs/display"
import { isVersionMatched, saveBlitzVersion } from "./blitz-version"
import { normalize, ServerConfig } from "./config"
import { loadCustomServer } from "./create-blitz-app"
import { nextStartDev } from "./next-utils"
import { configureStages } from "./stages"

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
  } = await normalize({ ...config, env: "dev" })

  // if blitz version is mismatched, we need to bust the cache by cleaning the devFolder
  const versionMatched = await isVersionMatched(devFolder)

  const stages = configureStages({ writeManifestFile, isTypescript })

  const { manifest } = await transformFiles(rootFolder, stages, devFolder, {
    ignore,
    include,
    watch,
    clean: !versionMatched || clean,
  })

  if (!versionMatched) await saveBlitzVersion(devFolder)

  const customServer = await loadCustomServer(devFolder)

  if (customServer) {
    log.success('Custom server loaded')
  } else {
    await nextStartDev(nextBin, devFolder, manifest, devFolder, config)
  }
}
