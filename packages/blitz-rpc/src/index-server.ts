import {assert, baseLogger, chalk, compose, Ctx, merge, newLine, ResolverConfig} from "blitz"
import {NextApiRequest, NextApiResponse} from "next"
import {resolve} from "path"
import {deserialize, parse, serialize as superjsonSerialize} from "superjson"
import {RpcLogger} from "./rpc-logger"
import {LoaderOptions} from "./server/loader/utils/loader-utils"
import {RpcLoggerOptions} from "./server/plugin"

// TODO - optimize end user server bundles by not exporting all client stuff here
export * from "./index-browser"
export {RpcServerPlugin} from "./server/plugin"

export * from "./server/resolvers/resolver"

// Mechanism used by Vite/Next/Nuxt plugins for automatically loading query and mutation resolvers
function isObject(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === "object" && value !== null
}

const defaultConfig: ResolverConfig = {
  httpMethod: "POST",
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
type ResolverFiles = Record<
  string,
  {
    absoluteResolverPath: string
    resolver: () => Promise<{default?: Resolver; config?: ResolverConfig}>
  }
>
export type ResolverPathOptions = "queries|mutations" | "root" | ((path: string) => string)

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
  absoluteResolverPath: string,
  resolver: () => Promise<{default?: Resolver; config?: ResolverConfig}>,
) {
  g.blitzRpcResolverFilesLoaded = g.blitzRpcResolverFilesLoaded || {}
  const existingResolver = g.blitzRpcResolverFilesLoaded[routePath]
  if (existingResolver && existingResolver.absoluteResolverPath !== absoluteResolverPath) {
    const logger = new RpcLogger(routePath)
    const errorMessage = `\nThe following resolver files resolve to the same path: ${routePath}\n\n1.  ${absoluteResolverPath}\n2.  ${
      existingResolver.absoluteResolverPath
    }\n\nPossible Solutions:\n\n1. Remove or rename one of the resolver files. \n2. Set the following in your in next.config.js to load all resolvers using their absolute paths: 
    \n\n//next.config.js\nblitz:{\n  resolverPath: "root",\n},\n
    \n${
      process.env.NODE_ENV === "production"
        ? `Resolver in ${absoluteResolverPath} is currently being shadowed by ${existingResolver.absoluteResolverPath}`
        : ""
    }
    `
    logger.error(errorMessage)
    if (process.env.NODE_ENV !== "production") {
      g.blitzRpcResolverFilesLoaded[routePath] = {
        absoluteResolverPath,
        resolver: async () => {
          return {
            ...(await resolver()),
            default: async () => {
              const error = new Error(errorMessage)
              error.name = "BlitzRPCResolverCollisionError"
              error.stack = ""
              throw error
            },
          }
        },
      }
    }
  } else {
    g.blitzRpcResolverFilesLoaded[routePath] = {
      absoluteResolverPath,
      resolver,
    }
  }
  return resolver
}

const dir = __dirname + (() => "")() // trick to avoid `@vercel/ncc` to glob import
const loaderClient = resolve(dir, "./loader-client.cjs")
const loaderServer = resolve(dir, "./loader-server.cjs")
const loaderServerResolvers = resolve(dir, "./loader-server-resolvers.cjs")

interface WebpackRule {
  test: RegExp
  use: Array<{
    loader: string
    options: LoaderOptions
  }>
}

export interface InstallWebpackConfigOptions {
  webpackConfig: {
    resolve: {
      alias: {
        [key: string]: boolean | string
      }
    }
    plugins: any[]
    module: {
      rules: WebpackRule[]
    }
  }
  webpackRuleOptions: LoaderOptions
}

export function installWebpackConfig({
  webpackConfig,
  webpackRuleOptions,
}: InstallWebpackConfigOptions) {
  webpackConfig.resolve.alias["npm-which"] = false
  webpackConfig.resolve.alias["cross-spawn"] = false
  webpackConfig.module.rules.push({
    test: /[\\/]\[\[\.\.\.blitz]]?.+\.[jt]sx?$/,
    use: [
      {
        loader: loaderServer,
        options: webpackRuleOptions,
      },
    ],
  })
  webpackConfig.module.rules.push({
    test: /[\\/](queries|mutations)[\\/]/,
    use: [
      {
        loader: loaderClient,
        options: webpackRuleOptions,
      },
      {
        loader: loaderServerResolvers,
        options: webpackRuleOptions,
      },
    ],
  })
}

export function installTurboConfig() {
  return {
    resolveAlias: {
      "cross-spawn": {browser: ".blitz/turbopack-empty.js"},
      "npm-which": {browser: ".blitz/turbopack-empty.js"},
      fs: {browser: ".blitz/turbopack-empty.js"},
      child_process: {browser: ".blitz/turbopack-empty.js"},
    },
    rules: {
      "**/*...blitz*.{jsx,tsx,js,ts}": {
        default: {
          loaders: [{loader: loaderServer, options: {}}],
          as: "*.ts",
        },
      },
      "**/{queries,mutations}/**": {
        browser: {
          loaders: [
            {
              loader: loaderClient,
              options: {},
            },
          ],
          as: "*.ts",
        },
        default: {
          loaders: [
            {
              loader: loaderServerResolvers,
              options: {},
            },
          ],
          as: "*.ts",
        },
      },
    },
  }
}

// ----------
// END LOADER
// ----------

async function getResolverMap(): Promise<ResolverFiles | null | undefined> {
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

interface RpcConfig {
  onError?: (error: Error, ctx?: Ctx) => void
  formatError?: (error: Error, ctx?: Ctx) => Error
  logging?: RpcLoggerOptions
}

export function rpcHandler(config: RpcConfig) {
  return async function handleRpcRequest(req: NextApiRequest, res: NextApiResponse, ctx: Ctx) {
    const resolverMap = await getResolverMap()
    assert(resolverMap, "No query or mutation resolvers found")
    assert(
      Array.isArray(req.query.blitz),
      "It seems your Blitz RPC endpoint file is not named [[...blitz]].(jt)s. Please ensure it is",
    )

    const relativeRoutePath = (req.query.blitz as string[])?.join("/")
    const routePath = "/" + relativeRoutePath
    const resolverName = routePath.replace(/(\/api\/rpc)?\//, "")
    const rpcLogger = new RpcLogger(resolverName, config.logging)

    const loadableResolver = resolverMap?.[routePath]?.resolver
    if (!loadableResolver) {
      throw new Error("No resolver for path: " + routePath)
    }

    const {default: resolver, config: resolverConfig} = await loadableResolver()

    if (!resolver) {
      throw new Error("No default export for resolver path: " + routePath)
    }

    const resolverConfigWithDefaults = {...defaultConfig, ...resolverConfig}

    if (req.method === "HEAD") {
      // We used to initiate database connection here
      res.status(200).end()
      return
    } else if (
      req.method === "POST" ||
      (req.method === "GET" && resolverConfigWithDefaults.httpMethod === "GET")
    ) {
      if (req.method === "POST" && typeof req.body.params === "undefined") {
        const error = {message: "Request body is missing the `params` key"}
        rpcLogger.error(error.message)
        res.status(400).json({
          result: null,
          error,
        })
        return
      }
      try {
        const data = deserialize({
          json:
            req.method === "POST"
              ? req.body.params
              : req.query.params
              ? parse(`${req.query.params}`)
              : undefined,
          meta:
            req.method === "POST"
              ? req.body.meta?.params
              : req.query.meta
              ? parse(`${req.query.meta}`)
              : undefined,
        })
        rpcLogger.timer.initResolver()
        rpcLogger.preResolver(data)

        const result = await resolver(data, (res as any).blitzCtx)
        rpcLogger.timer.resolverDuration()
        rpcLogger.postResolver(result)

        rpcLogger.timer.initSerialization()
        const serializedResult = superjsonSerialize(result)

        rpcLogger.timer.initNextJsSerialization()
        ;(res as any).blitzResult = result
        ;(ctx as any)?.session.setSession(res)
        res.json({
          result: serializedResult.json,
          error: null,
          meta: {
            result: serializedResult.meta,
          },
        })
        rpcLogger.timer.nextJsSerializationDuration()
        rpcLogger.nextJsSerialization()

        rpcLogger.timer.serializerDuration().totalDuration()
        rpcLogger.postResponse()

        return
      } catch (error: any) {
        if (error._clearStack) {
          error.stack = ""
        }

        config.onError?.(error, ctx)
        rpcLogger.error(error)

        if (!error.statusCode) {
          error.statusCode = 500
        }

        const formattedError = config.formatError?.(error, ctx) ?? error
        const serializedError = superjsonSerialize(formattedError)

        ;(ctx as any)?.session.setSession(res)

        res.json({
          result: null,
          error: serializedError.json,
          meta: {
            error: serializedError.meta,
          },
        })
        return
      }
    } else {
      // Everything else is error
      rpcLogger.warn(`${req.method} method not supported`)
      res.status(404).end()
      return
    }
  }
}

type Params = Record<string, unknown>

type SessionContext = (request: Request) => Promise< Ctx["session"]>

export function rpcAppHandler(config: RpcConfig, sessionContext?: SessionContext) {
  async function handleRpcRequest(req: Request, context: {params: Params}) {
    const resolverMap = await getResolverMap()
    assert(resolverMap, "No query or mutation resolvers found")

    assert(
      Array.isArray(context.params.blitz),
      "It seems your Blitz RPC endpoint file is not named [[...blitz]].(jt)s. Please ensure it is",
    )

    const relativeRoutePath = (context.params.blitz as string[])?.join("/")
    const routePath = "/" + relativeRoutePath
    const resolverName = routePath.replace(/(\/api\/rpc)?\//, "")
    const rpcLogger = new RpcLogger(resolverName, config.logging)

    const loadableResolver = resolverMap?.[routePath]?.resolver
    if (!loadableResolver) {
      throw new Error("No resolver for path: " + routePath)
    }

    const {default: resolver, config: resolverConfig} = await loadableResolver()

    if (!resolver) {
      throw new Error("No default export for resolver path: " + routePath)
    }

    const resolverConfigWithDefaults = {...defaultConfig, ...resolverConfig}

    if (req.method === "HEAD") {
      // We used to initiate database connection here
      return new Response(null, {status: 200})
    }

    if (
      req.method === "POST" ||
      (req.method === "GET" && resolverConfigWithDefaults.httpMethod === "GET")
    ) {
      const body = await req.json()
      if (req.method === "POST" && typeof body.params === "undefined") {
        const error = {message: "Request body is missing the `params` key"}
        rpcLogger.error(error.message)
        return new Response(JSON.stringify({result: null, error}), {status: 400})
      }
      const session = await sessionContext?.(req)
      try {
        const data = deserialize({
          json:
            req.method === "POST"
              ? body.params
              : context.params.params
              ? parse(`${context.params.params}`)
              : undefined,
          meta:
            req.method === "POST"
              ? body.meta?.params
              : context.params.meta
              ? parse(`${context.params.meta}`)
              : undefined,
        })
        rpcLogger.timer.initResolver()
        rpcLogger.preResolver(data)

        const result = await resolver(data, {session})
        rpcLogger.timer.resolverDuration()
        rpcLogger.postResolver(result)

        rpcLogger.timer.initSerialization()
        const serializedResult = superjsonSerialize(result)

        rpcLogger.timer.initNextJsSerialization()
        const response = new Response(
          JSON.stringify({
            result: serializedResult.json,
            error: null,
            meta: {
              result: serializedResult.meta,
            },
          }),
        )
        ;(session as any)?.setSession(response)
        return response
      } catch (error: any) {
        if (error._clearStack) {
          error.stack = ""
        }

        config.onError?.(error, {session} as Ctx)
        rpcLogger.error(error)

        if (!error.statusCode) {
          error.statusCode = 500
        }

        const formattedError = config.formatError?.(error, {session} as Ctx) ?? error
        const serializedError = superjsonSerialize(formattedError)

        const response =  new Response(
          JSON.stringify({
            result: null,
            error: serializedError.json,
            meta: {
              error: serializedError.meta,
            },
          }),
        )
        ;(session as any)?.setSession(response)
        return response
      }
    } else {
      // Everything else is error
      rpcLogger.warn(`${req.method} method not supported`)
      return new Response(null, {status: 404})
    }
  }

  return {
    GET: handleRpcRequest,
    POST: handleRpcRequest,
    HEAD: handleRpcRequest,
  }
}
