import {existsSync, readJSONSync} from "fs-extra"
import {join} from "path"
import path from "path"
import pkgDir from "pkg-dir"

export function getProjectRoot() {
  return pkgDir.sync() || process.cwd()
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

  const pkgJson = readJSONSync(join(getProjectRoot(), "package.json"))

  let blitzConfig = {
    _meta: {
      packageName: pkgJson.name,
    },
  }

  const projectRoot = getProjectRoot()
  const nextConfigPath = path.join(projectRoot, "next.config.js")
  const blitzConfigPath = path.join(projectRoot, "blitz.config.js")

  try {
    // --------------------------------
    // Load next.config.js if it exists
    // --------------------------------
    let loadedNextConfig = {}
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
    let loadedBlitzConfig = eval("require")(blitzConfigPath)
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
  } catch {
    console.error("Failed to load config in getConfig()")
  }

  global.blitzConfig = blitzConfig
  return blitzConfig
}
