import * as esbuild from "esbuild"
import fs from "fs"
import {existsSync, readJSONSync} from "fs-extra"
import {PublicNextConfig} from "next/dist/next-server/server/config"
import path, {join} from "path"
import pkgDir from "pkg-dir"
const debug = require("debug")("blitz:config")

type NextExperimental = PublicNextConfig["experimental"]

interface Experimental extends NextExperimental {
  isomorphicResolverImports?: boolean
}

export interface BlitzConfig extends Omit<PublicNextConfig, "experimental" | "future"> {
  target?: string
  experimental?: Experimental
  future?: PublicNextConfig["future"]
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
export function getConfigBuildPath() {
  return path.join(getProjectRoot(), ".blitz", "blitz.config.js")
}

interface BuildConfigOptions {
  watch?: boolean
}

export async function buildConfig({watch}: BuildConfigOptions = {}) {
  debug("Starting buildConfig...")
  const dir = pkgDir.sync()
  if (!dir) {
    // This will happen when running blitz no inside a blitz app
    debug("Unable to find package directory")
    return
  }
  const pkg = readJSONSync(path.join(dir, "package.json"))
  const srcPath = getConfigSrcPath()

  if (fs.readFileSync(srcPath, "utf8").includes("tsconfig-paths/register")) {
    // User is manually handling their own typescript stuff
    debug("Config contains 'tsconfig-paths/register', so skipping build")
    return
  }

  const esbuildOptions: esbuild.BuildOptions = {
    entryPoints: [srcPath],
    outfile: getConfigBuildPath(),
    format: "cjs",
    bundle: true,
    platform: "node",
    external: [
      "blitz",
      "next",
      ...Object.keys(require("blitz/package").dependencies),
      ...Object.keys(pkg?.dependencies ?? {}),
      ...Object.keys(pkg?.devDependencies ?? {}),
    ],
  }

  if (watch) {
    esbuildOptions.watch = {
      onRebuild(error) {
        if (error) {
          console.error("Failed to re-build blitz config")
        } else {
          console.log("\n> Blitz config changed - restart for changes to take effect\n")
        }
      },
    }
  }

  debug("Building config...")
  debug("Src: ", getConfigSrcPath())
  debug("Build: ", getConfigBuildPath())
  await esbuild.build(esbuildOptions)
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
  let blitzConfigPath
  if (existsSync(path.join(projectRoot, ".blitz"))) {
    blitzConfigPath = path.join(projectRoot, ".blitz", "blitz.config.js")
  } else {
    // projectRoot is inside .blitz/build/
    blitzConfigPath = path.join(projectRoot, "..", "blitz.config.js")
  }

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
