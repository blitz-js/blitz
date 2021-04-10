import {existsSync, readJSONSync} from "fs-extra"
import {join} from "path"
import path from "path"
import pkgDir from "pkg-dir"
const debug = require("debug")("blitz:config")

export function getProjectRoot() {
  return (
    path.dirname(path.resolve(process.cwd(), "blitz.config.js")) || pkgDir.sync() || process.cwd()
  )
}

export interface BlitzConfig extends Record<string, unknown> {
  target?: string
  experimental?: {
    isomorphicResolverImports?: boolean
    reactMode?: string
  }
  cli?: {
    clearConsoleOnBlitzDev?: boolean
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

  let pkgJson: any

  const pkgJsonPath = join(getProjectRoot(), "package.json")
  if (existsSync(pkgJsonPath)) {
    pkgJson = readJSONSync(join(getProjectRoot(), "package.json"))
  }

  let blitzConfig = {
    _meta: {
      packageName: pkgJson?.name,
    },
  }

  const projectRoot = getProjectRoot()
  const nextConfigPath = path.join(projectRoot, "next.config.js")
  const blitzConfigPath = path.join(projectRoot, "blitz.config.js")

  debug("nextConfigPath: " + nextConfigPath)
  debug("blitzConfigPath: " + blitzConfigPath)

  let loadedNextConfig = {}
  let loadedBlitzConfig = {}
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
    // https://github.com/blitz-js/blitz/issues/2080
    if (!process.env.JEST_WORKER_ID) {
      console.error("Failed to load config in getConfig()", error)
    }
  }

  // Idk why, but during startup first result of loading blitz config is empty
  // Therefore don't cache it so that next time will load the full config properly
  if (Object.keys(loadedBlitzConfig).length) {
    global.blitzConfig = blitzConfig
  }
  return blitzConfig
}
