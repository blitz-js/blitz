import {existsSync, readJSONSync} from "fs-extra"
import {NextConfig} from "next/dist/next-server/server/config"
import path, {join} from "path"
const debug = require("debug")("blitz:config")

type NextExperimental = NextConfig["experimental"]

interface Experimental extends NextExperimental {
  isomorphicResolverImports?: boolean
}

export interface BlitzConfig extends Omit<NextConfig, "experimental" | "future"> {
  target?: string
  experimental?: Experimental
  future?: NextConfig["future"]
  cli?: {
    clearConsoleOnBlitzDev?: boolean
    httpProxy?: string
    httpsProxy?: string
    noProxy?: string
  }
  log?: {
    level: "trace" | "debug" | "info" | "warn" | "error" | "fatal"
  }
  middleware?: Record<string, any> &
    {
      (req: any, res: any, next: any): Promise<void> | void
      type?: string
      config?: {
        cookiePrefix?: string
      }
    }[]
  customServer?: {
    hotReload?: boolean
  }
}

export interface BlitzConfigNormalized extends BlitzConfig {
  _meta: {
    packageName: string
  }
}

export function getProjectRoot() {
  return path.dirname(getConfigSrcPath())
}

export function getConfigSrcPath() {
  const tsPath = path.resolve(path.join(process.cwd(), "blitz.config.ts"))
  if (existsSync(tsPath)) {
    return tsPath
  } else {
    const jsPath = path.resolve(path.join(process.cwd(), "blitz.config.js"))
    return jsPath
  }
}
declare global {
  namespace NodeJS {
    interface Global {
      blitzConfig: BlitzConfigNormalized
    }
  }
}

/**
 * @param {boolean | undefined} reload - reimport config files to reset global cache
 */
export const getConfig = (reload?: boolean): BlitzConfigNormalized => {
  if (global.blitzConfig && Object.keys(global.blitzConfig).length > 0 && !reload) {
    return global.blitzConfig
  }

  const {PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER} = require("next/constants")

  const projectRoot = getProjectRoot()

  let pkgJson: any

  const pkgJsonPath = join(getProjectRoot(), "package.json")
  if (existsSync(pkgJsonPath)) {
    pkgJson = readJSONSync(pkgJsonPath)
  }

  let blitzConfig = {
    _meta: {
      packageName: pkgJson?.name,
    },
  }

  const nextConfigPath = path.join(projectRoot, "next.config.js")
  const blitzConfigPath = path.join(projectRoot, ".blitz.config.compiled.js")

  debug("nextConfigPath: " + nextConfigPath)
  debug("blitzConfigPath: " + blitzConfigPath)

  let loadedNextConfig = {}
  let loadedBlitzConfig: any = {}
  try {
    // --------------------------------
    // Load next.config.js if it exists
    // --------------------------------
    if (existsSync(nextConfigPath)) {
      // eslint-disable-next-line no-eval -- block webpack from following this module path
      loadedNextConfig = eval("require")(nextConfigPath)
      if (typeof loadedNextConfig === "function") {
        const phase =
          process.env.NODE_ENV === "production" ? PHASE_PRODUCTION_SERVER : PHASE_DEVELOPMENT_SERVER
        loadedNextConfig = loadedNextConfig(phase, {})
      }
    }

    // --------------------------------
    // Load blitz.config.js
    // --------------------------------
    // eslint-disable-next-line no-eval -- block webpack from following this module path
    loadedBlitzConfig = eval("require")(blitzConfigPath)
    if (typeof loadedBlitzConfig === "function") {
      const phase =
        process.env.NODE_ENV === "production" ? PHASE_PRODUCTION_SERVER : PHASE_DEVELOPMENT_SERVER
      loadedBlitzConfig = loadedBlitzConfig(phase, {})
    }
    // -------------
    // Merge configs
    // -------------
    blitzConfig = {
      ...blitzConfig,
      ...loadedNextConfig,
      ...loadedBlitzConfig,
    }
  } catch (error) {
    debug("Failed to load config in getConfig()", error)
  }

  // Idk why, but during startup first result of loading blitz config is empty
  // Therefore don't cache it so that next time will load the full config properly
  if (Object.keys(loadedBlitzConfig).length) {
    global.blitzConfig = blitzConfig
  }
  return blitzConfig
}
