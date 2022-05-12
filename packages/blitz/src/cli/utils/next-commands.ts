import {normalize, ServerConfig} from "./config"
import {
  nextBuild,
  nextStart,
  nextStartDev,
  customServerExists,
  startCustomServer,
  buildCustomServer,
} from "./next-utils"
import * as fs from "fs"
import * as path from "path"

export async function build(config: ServerConfig) {
  const {rootFolder, nextBin, watch} = await normalize(config)

  await nextBuild(nextBin, rootFolder, {} as any, config)
  if (customServerExists()) await buildCustomServer({watch})
}

export function readBlitzConfig(rootFolder: string = process.cwd()) {
  const packageJsonFile = fs.readFileSync(path.join(rootFolder, "package.json"), {
    encoding: "utf8",
    flag: "r",
  })
  const packageJson = JSON.parse(packageJsonFile)

  return packageJson.blitz || {}
}

export async function dev(config: ServerConfig) {
  const {rootFolder, nextBin} = await normalize({...config, env: "dev"})

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
