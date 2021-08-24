import {getConfig} from "@blitzjs/config"
import {log} from "@blitzjs/display"
import {normalize, ServerConfig} from "./config"
import {customServerExists, nextStartDev, startCustomServer} from "./next-utils"

export async function dev(config: ServerConfig) {
  const {rootFolder, nextBin} = await normalize({...config, env: "dev"})

  if (customServerExists()) {
    log.success("Using your custom server")

    const blitzConfig = getConfig()
    const watch = blitzConfig.customServer?.hotReload ?? true

    await startCustomServer(rootFolder, config, {watch})
  } else {
    await nextStartDev(nextBin, rootFolder, {} as any, rootFolder, config)
  }
}
