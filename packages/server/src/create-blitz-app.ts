import next from "next"
import {alreadyBuilt} from "./build-hash"
import {normalize,ServerConfig} from "./config"
import {configureStages} from "./stages"

const debug = require("debug")("blitz:create-blitz-app")
interface CreateBlitzAppConfig {
  dev: boolean
}

export async function createBlitzApp({ dev }: CreateBlitzAppConfig) {
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
    buildFolder,
    env,
  } = await normalize({ ...serverConfig, env: "dev" })

  debug(`createBlitzApp`, {
    devFolder,
    buildFolder,
    env,
  })
  if (dev) {
    // dev
    const stages = configureStages({ writeManifestFile, isTypescript })

    await transformFiles(rootFolder, stages, devFolder, {
      ignore,
      include,
      watch,
      clean,
    })
  } else {
    // prod
    if (!(await alreadyBuilt(buildFolder))) {
      throw new Error('Blitz is not built - make sure to run `blitz build` before starting in production.')
    }
  }
  const dir = dev ? devFolder : buildFolder
  const app = next({ dev, dir })
  const requestHandler = app.getRequestHandler()

  await app.prepare()

  return {
    requestHandler,
  }
}
