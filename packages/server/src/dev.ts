import {getConfig} from "@blitzjs/config"
import {log} from "@blitzjs/display"
import {isVersionMatched, saveBlitzVersion} from "./blitz-version"
import {normalize, ServerConfig} from "./config"
import {customServerExists, nextStartDev, startCustomServer} from "./next-utils"
import {configureStages} from "./stages"

export async function dev(config: ServerConfig) {
  const {
    rootFolder,
    transformFiles,
    nextBin,
    buildFolder,
    ignore,
    include,
    isTypeScript,
    writeManifestFile,
    watch,
    clean,
    env,
  } = await normalize({...config, env: "dev"})

  // if blitz version is mismatched, we need to bust the cache by cleaning the buildFolder
  const versionMatched = await isVersionMatched(buildFolder)

  const {stages, overrideTriage} = await configureStages({
    writeManifestFile,
    isTypeScript,
    buildFolder,
    env,
  })

  const {manifest} = await transformFiles(rootFolder, stages, buildFolder, {
    ignore,
    include,
    watch,
    clean: !versionMatched || clean,
    overrideTriage,
  })

  if (!versionMatched) await saveBlitzVersion(buildFolder)

  if (customServerExists()) {
    log.success("Using your custom server")

    const blitzConfig = getConfig()
    const watch = blitzConfig.customServer?.hotReload ?? true

    await startCustomServer(buildFolder, config, {watch})
  } else {
    await nextStartDev(nextBin, buildFolder, manifest, buildFolder, config)
  }
}
