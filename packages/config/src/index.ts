import {readJSONSync} from "fs-extra"
import {join} from "path"
import path from "path"
import pkgDir from "pkg-dir"

// Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
path.resolve("next.config.js")
path.resolve("blitz.config.js")
// path.resolve(".next/blitz/db.js")
// End anti-tree-shaking

export function getProjectRoot() {
  return pkgDir.sync() || process.cwd()
}

const projectRoot = getProjectRoot()

export const resolveAliases = {
  node: {
    "__blitz__/config-file": path.join(projectRoot, "blitz.config.js"),
  },
  webpack: {
    // In webpack build, next.config.js is always present which wraps blitz.config.js
    "__blitz__/config-file": path.join(projectRoot, "next.config.js"),
  },
}

require("module-alias").addAliases(resolveAliases.node)

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

  let file
  let loadedConfig = {}
  try {
    // eslint-disable-next-line no-eval -- block webpack from following this module path
    file = eval("require")("__blitz__/config-file")
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
