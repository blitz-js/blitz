import {log} from "next/dist/server/lib/logging"
import {normalize, ServerConfig} from "./config"
import {customServerExists, nextStartDev, startCustomServer} from "./next-utils"

export async function dev(config: ServerConfig) {
  const {rootFolder, nextBin} = await normalize({...config, env: "dev"})

  if (customServerExists()) {
    log.success("Using your custom server")

    const {loadConfigProduction} = await import("next/dist/server/config-shared")
    const blitzConfig = loadConfigProduction(config.rootFolder)
    const watch = blitzConfig.customServer?.hotReload ?? true

    await startCustomServer(rootFolder, config, {watch})
  } else {
    await nextStartDev(nextBin, rootFolder, {} as any, rootFolder, config)
  }
}
