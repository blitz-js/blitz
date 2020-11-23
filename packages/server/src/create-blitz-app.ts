import next from "next"
import path from 'path'
import { normalize, ServerConfig } from "./config"
const debug = require("debug")("blitz:create-blitz-app")
interface CreateBlitzAppConfig {
  dev: boolean
}

export async function loadCustomServer(dir: string): Promise<boolean> {
  try {
    const serverPath = path.resolve(dir, 'server')
    debug('getCustomServer:', serverPath)
    const serverModule = await import(serverPath)

    debug('getCustomServer', serverModule)

    return true
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      debug('getCustomServer module not found')
      return false
    }

    throw err
  }
}

export async function createBlitzApp({ dev }: CreateBlitzAppConfig) {
  const serverConfig: ServerConfig = {
    env: dev ? "dev" : "prod",
    rootFolder: process.cwd(),
  }
  const {
    devFolder,
    buildFolder,
  } = await normalize({ ...serverConfig, env: "dev" })

  const dir = dev ? devFolder : buildFolder
  const app = next({ dev, dir })
  const requestHandler = app.getRequestHandler()

  await app.prepare()

  return {
    requestHandler,
  }
}
