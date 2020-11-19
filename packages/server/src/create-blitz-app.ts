import next from "next"
import {normalize, ServerConfig} from "./config"
import {configureStages} from "./stages"

interface CreateBlitzAppConfig {
  dev: boolean
}

export async function createBlitzApp({dev}: CreateBlitzAppConfig) {
  const serverConfig: ServerConfig = {
    env: dev ? "dev" : "prod",
    rootFolder: process.cwd(),
    // port
    // hostname
    // inspect
    // clean: flags["no-incremental-build"],
  }
  const {
    rootFolder,
    transformFiles,
    devFolder,
    ignore,
    include,
    isTypescript,
    writeManifestFile,
    watch,
    clean,
  } = await normalize({...serverConfig, env: "dev"})

  if (dev) {
    const stages = configureStages({writeManifestFile, isTypescript})

    await transformFiles(rootFolder, stages, devFolder, {
      ignore,
      include,
      watch,
      clean,
    })

    const app = next({dev, dir: devFolder})
    const requestHandler = app.getRequestHandler()

    await app.prepare()

    return {
      requestHandler,
    }
  }

  throw new Error("Unimplemented")
}
