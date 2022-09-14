import {normalize, ServerConfig} from "./config"
import {
  nextBuild,
  nextStart,
  nextStartDev,
  customServerExists,
  startCustomServer,
  buildCustomServer,
} from "./next-utils"
import {checkLatestVersion} from "./check-latest-version"
import {readBlitzConfig} from "../../utils/server"
import {codegenTasks} from "./codegen-tasks"

export async function build(config: ServerConfig) {
  const {rootFolder, nextBin, watch} = await normalize(config)
  await codegenTasks()
  await nextBuild(nextBin, rootFolder, {} as any, config)
  if (customServerExists()) await buildCustomServer({watch})
}

export async function dev(config: ServerConfig) {
  const {rootFolder, nextBin} = await normalize({...config, env: "dev"})
  await codegenTasks()
  // void checkLatestVersion()
  if (customServerExists()) {
    console.log("Using your custom server")

    const blitzConfig = readBlitzConfig(rootFolder)
    const watch = blitzConfig.customServer?.hotReload ?? true

    await startCustomServer(rootFolder, config, {watch})
  } else {
    await nextStartDev(nextBin, rootFolder, {} as any, rootFolder, config)
  }
}

export async function prod(config: ServerConfig) {
  const {rootFolder, nextBin} = await normalize(config)

  if (customServerExists()) {
    console.log("Using your custom server")
    await startCustomServer(rootFolder, config)
  } else {
    await nextStart(nextBin, rootFolder, config)
  }
}
