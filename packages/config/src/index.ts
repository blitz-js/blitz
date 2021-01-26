import {existsSync} from "fs"
import {join} from "path"
import pkgDir from "pkg-dir"

const configFiles = ["blitz.config.js", "next.config.js"]

export interface BlitzConfig extends Record<string, unknown> {
  target?: string
  experimental?: {
    isomorphicResolverImports?: boolean
    reactMode?: string
  }
  _meta: {
    packageName: string
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      blitzConfig: BlitzConfig
    }
  }
}

/**
 * @param {boolean | undefined} reload - reimport config files to reset global cache
 */
export const getConfig = (reload?: boolean): BlitzConfig => {
  if (global.blitzConfig && Object.keys(global.blitzConfig).length > 0 && !reload) {
    return global.blitzConfig
  }

  const {PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER} = require("next/constants")

  const projectRoot = pkgDir.sync() || process.cwd()
  const pkgJson = require(join(projectRoot, "package.json"))

  let blitzConfig = {
    _meta: {
      packageName: pkgJson.name,
    },
  }

  for (const configFile of configFiles) {
    if (existsSync(join(projectRoot, configFile))) {
      const path = join(projectRoot, configFile)
      const file = require(path)
      let contents
      if (typeof file === "function") {
        const phase =
          process.env.NODE_ENV === "production" ? PHASE_PRODUCTION_SERVER : PHASE_DEVELOPMENT_SERVER
        contents = file(phase, {})
      } else {
        contents = file
      }
      blitzConfig = {
        ...blitzConfig,
        ...contents,
      }
    }
  }

  global.blitzConfig = blitzConfig

  return blitzConfig
}
