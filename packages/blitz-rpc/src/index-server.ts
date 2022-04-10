import {assert} from "blitz"
import {NextApiRequest, NextApiResponse} from "next"

export * from "./index-browser"

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
type ResolverFiles = Record<string, () => Promise<{default?: Resolver}>>

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

export function __internal_addBlitzRpcResolver(
  routePath: string,
  resolver: () => Promise<{default?: Resolver}>,
) {
  g.blitzRpcResolverFilesLoaded = g.blitzRpcResolverFilesLoaded || {}
  g.blitzRpcResolverFilesLoaded[routePath] = resolver
  return resolver
}

import {resolve} from "path"
const dir = __dirname + (() => "")() // trick to avoid `@vercel/ncc` to glob import
const loaderServer = resolve(dir, "./loader-server.cjs")
const loaderClient = resolve(dir, "./loader-client.cjs")

export function install<T extends any[]>(config: {module?: {rules?: T}}) {
  config.module!.rules!.push({
    test: /\/\[\[\.\.\.blitz]]\.[jt]s$/,
    use: [{loader: loaderServer}],
  })
  config.module!.rules!.push({
    test: /[\\/](queries|mutations)[\\/]/,
    use: [{loader: loaderClient}],
  })
}

// import type { NextConfig } from 'next'
type NextConfig = any

export function blitzPlugin(nextConfig: NextConfig = {}) {
  return Object.assign({}, nextConfig, {
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

async function loadResolverFiles(): Promise<ResolverFiles | null | undefined> {
  // Handles:
  // - Next.js
  // - Nuxt
  // - Vite with `importBuild.js`
  {
    const resolverFilesLoaded = loadBlitzRpcResolverFilesWithInternalMechanism()
    if (resolverFilesLoaded) {
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
}

export async function handleRpcRequest(req: NextApiRequest, res: NextApiResponse) {
  const resolverFilesLoaded = await loadResolverFiles()
  assert(resolverFilesLoaded, "No query or mutation resolvers found")
  assert(
    Array.isArray(req.query.blitz),
    "It seems your Blitz RPC endpoint file is not named [[...blitz]].(jt)s. Please ensure it is",
  )

  const routePath = "/" + req.query.blitz.join("/")

  const loadableResolver = resolverFilesLoaded[routePath]
  if (!loadableResolver) {
    throw new Error("No resolver for path: " + routePath)
  }

  const resolver = (await loadableResolver()).default
  if (!resolver) {
    throw new Error("No default export for resolver path: " + routePath)
  }

  await resolver(req.body)
}
