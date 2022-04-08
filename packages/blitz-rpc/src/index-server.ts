import {assert} from "blitz"
import {IncomingMessage, ServerResponse} from "http"

export * from "./index-browser"

import {win32, posix, sep} from "path"

// -----
// UTILS
// -----
export function assertPosixPath(path: string) {
  const errMsg = `Wrongly formatted path: ${path}`
  assert(!path.includes(win32.sep), errMsg)
  // assert(path.startsWith('/'), errMsg)
}

export function toPosixPath(path: string) {
  if (process.platform !== "win32") {
    assert(sep === posix.sep, "TODO")
    assertPosixPath(path)
    return path
  } else {
    assert(sep === win32.sep, "TODO")
    const pathPosix = path.split(win32.sep).join(posix.sep)
    assertPosixPath(pathPosix)
    return pathPosix
  }
}

export function toSystemPath(path: string) {
  path = path.split(posix.sep).join(sep)
  path = path.split(win32.sep).join(sep)
  return path
}
// ---------
// END UTILS
// ---------

// Mechanism used by Vite/Next/Nuxt plugins for automatically loading query and mutation resolvers

function isObject(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === "object" && value !== null
}
function getGlobalObject<T extends Record<string, unknown>>(key: string, defaultValue: T): T {
  assert(key.startsWith("__internal_blitz"), "unsupported key")
  if (typeof global === "undefined") {
    return defaultValue
  }
  assert(isObject(global), "not an object")
  return ((global as Record<string, unknown>)[key] =
    ((global as Record<string, unknown>)[key] as T) || defaultValue)
}

type Resolver = (...args: unknown[]) => Promise<unknown>
type ResolverFiles = Record<string, unknown>

// We define `global.__internal_blitzRpcResolverFiles` to ensure we use the same global object.
// Needed for Next.js. I'm guessing that Next.js is including the `node_modules/` files in a seperate bundle than user files.
const g = getGlobalObject<{blitzRpcResolverFilesLoaded: ResolverFiles | null}>(
  "__internal_blitzRpcResolverFiles",
  {
    blitzRpcResolverFilesLoaded: null,
  },
)

export function loadBlitzRpcResolverFilesWithInternalMechanism() {
  return g.blitzRpcResolverFilesLoaded
}

export function __internal_addBlitzRpcResolver(resolver: Resolver, {filePath}: {filePath: string}) {
  g.blitzRpcResolverFilesLoaded = g.blitzRpcResolverFilesLoaded || {}
  g.blitzRpcResolverFilesLoaded[filePath] = resolver

  console.log("DEBUG - __internal_addBlitzRpcResolver ", g.blitzRpcResolverFilesLoaded)
  return resolver
}

import {resolve} from "path"
const dir = __dirname + (() => "")() // trick to avoid `@vercel/ncc` to glob import
const loader = resolve(dir, "./loader.cjs")

export function install<T extends any[]>(config: {module?: {rules?: T}}) {
  config.module!.rules!.push({
    // TODO - exclude pages, api, etc.
    test: /\/queries\//,
    use: [{loader}],
  })
}

// import type { NextConfig } from 'next'
type NextConfig = any

export function blitzPlugin(nextConfig: NextConfig = {}) {
  return Object.assign({}, nextConfig, {
    //TODO fix type
    webpack: (config: any, options: any) => {
      install(config)
      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options)
      }
      return config
    },
  } as NextConfig)
}
// ----------
// END LOADER
// ----------

export async function handleRpcRequest(req: IncomingMessage, res: ServerResponse) {
  // TODO - stop hard coding input to loadResolverFiles
  const resolverFilesLoaded = await loadResolverFiles({
    root: null,
    isProduction: false,
    resolverFiles: null,
  })
  console.log("FILES loaded", resolverFilesLoaded)
  assert(resolverFilesLoaded, "No query or mutation resolvers found")
}

const assertUsage = assert as any

async function loadResolverFiles(runContext: {
  root: string | null
  // viteDevServer: ViteDevServer | null
  isProduction: boolean
  resolverFiles: string[] | null
}): Promise<ResolverFiles | null | undefined> {
  // Handles:
  // - When the user provides the telefunc file paths with `telefuncConfig.resolverFiles`
  // if (runContext.resolverFiles) {
  //   const telefuncFilesLoaded = loadTelefuncFilesFromConfig(
  //     runContext.resolverFiles,
  //     runContext.root,
  //   )
  //   return telefuncFilesLoaded
  // }

  // Handles:
  // - Next.js
  // - Nuxt
  // - Vite with `importBuild.js`
  {
    const resolverFilesLoaded = loadBlitzRpcResolverFilesWithInternalMechanism()
    console.log("resolverFilesLoaded", resolverFilesLoaded)
    if (resolverFilesLoaded) {
      assertUsage(Object.keys(resolverFilesLoaded).length > 0, getErrMsg("webpack"))
      return resolverFilesLoaded
    }
  }

  // Handles:
  // - Vite
  // {
  //   const {resolverFilesLoaded, viteProvider} = await loadTelefuncFilesWithVite(runContext)
  //   if (resolverFilesLoaded) {
  //     assertUsage(
  //       Object.keys(resolverFilesLoaded).length > 0,
  //       getErrMsg(`Vite [\`${viteProvider}\`]`),
  //     )
  //     return resolverFilesLoaded
  //   }
  // }

  assertUsage(
    false,
    "You don't seem to be using Blitz RPC with a supported stack. Reach out on GitHub or Discord.",
  )
}

function getErrMsg(crawler: string) {
  return "No queries or mutations found. Did you create one? (Crawler: " + crawler + ".)"
}
