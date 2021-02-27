import {existsSync, readJSONSync} from "fs-extra"
import {join} from "path"
import path from "path"
import pkgDir from "pkg-dir"

export function getProjectRoot() {
  return pkgDir.sync() || process.cwd()
}

export function getConfigFilePath() {
  const projectRoot = getProjectRoot()
  const bConfig = path.join(projectRoot, "blitz.config.js")
  const nConfig = path.join(projectRoot, "next.config.js")

  if (existsSync(nConfig)) {
    return nConfig
  } else {
    return bConfig
  }
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

  let file
  let loadedConfig = {}
  try {
    // eslint-disable-next-line no-eval -- block webpack from following this module path
    file = eval("require")(getConfigFilePath())
    if (typeof file === "function") {
      const phase =
        process.env.NODE_ENV === "production" ? PHASE_PRODUCTION_SERVER : PHASE_DEVELOPMENT_SERVER
      loadedConfig = file(phase, {})
    } else {
      loadedConfig = file
    }
  } catch {}
  blitzConfig = {
    ...loadedConfig,
    ...blitzConfig,
  }

  global.blitzConfig = blitzConfig
  return blitzConfig
}
