import {readJSONSync} from "fs-extra"
import {join} from "path"
import path from "path"
import pkgDir from "pkg-dir"

export function getProjectRoot() {
  return pkgDir.sync() || process.cwd()
}

export const resolveAliases = {
  node: {
    "__blitz__/config-file": process.cwd() + path.sep + "blitz.config.js",
  },
  webpack: {
    // In webpack build, next.config.js is always present which wraps blitz.config.js
    "__blitz__/config-file": process.cwd() + path.sep + "next.config.js",
  },
}

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

  const pkgJson = readJSONSync(join(getProjectRoot(), "package.json"))

  let blitzConfig = {
    _meta: {
      packageName: pkgJson.name,
    },
  }

  const file = require("__blitz__/config-file")
  let contents
  if (typeof file === "function") {
    const phase =
      process.env.NODE_ENV === "production" ? PHASE_PRODUCTION_SERVER : PHASE_DEVELOPMENT_SERVER
    contents = file(phase, {})
  } else {
    contents = file
  }
  blitzConfig = {
    ...contents,
    ...blitzConfig,
  }

  global.blitzConfig = blitzConfig
  return blitzConfig
}
