import {normalize, ServerConfig} from "./config"
import {nextBuild, nextExport, nextStart, nextStartDev} from "./next-utils"

export async function blitzExport(config: ServerConfig) {
  const {nextBin} = await normalize(config)
  await nextExport(nextBin, config)
}

export async function build(config: ServerConfig) {
  const {rootFolder, nextBin} = await normalize(config)

  await nextBuild(nextBin, rootFolder, {} as any, config)
}

export async function dev(config: ServerConfig) {
  const {rootFolder, nextBin} = await normalize({...config, env: "dev"})

  await nextStartDev(nextBin, rootFolder, {} as any, rootFolder, config)
}

export async function prod(config: ServerConfig) {
  const {rootFolder, nextBin} = await normalize(config)

  await nextStart(nextBin, rootFolder, config)
}
