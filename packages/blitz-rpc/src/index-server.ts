import {assert, baseLogger, chalk, Ctx, newLine, ResolverConfig} from "blitz"
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
  onError?: (error: Error, ctx: Ctx) => void
  formatError?: (error: Error, ctx: Ctx) => Error
  logging?: RpcLoggerOptions
}

export function rpcHandler(config: RpcConfig) {
  return async function handleRpcRequest(req: NextApiRequest, res: NextApiResponse) {
    const resolverMap = await getResolverMap()
    assert(resolverMap, "No query or mutation resolvers found")
    assert(
      Array.isArray(req.query.blitz),
      "It seems your Blitz RPC endpoint file is not named [[...blitz]].(jt)s. Please ensure it is",
    )
    const {resolverName, routePath} = parseResolverFromRequest(req.query.blitz as string[])
    const logger = initRpcLogger(resolverName)
    const {resolver, resolverConfigWithDefaults} = await loadResolver(resolverMap, routePath)
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
        logger.log.error(error.message)
        res.status(400).json({
          result: null,
          error,
        })
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
        const {result, serializedResult} = await executeBlitzResolver({
          resolverName,
          config,
          data,
          resolver,
          ctx: (res as any).blitzCtx,
          ...logger,
        })
        ;(res as any).blitzResult = result
        const jsonResult = {
          result: serializedResult.json,
          error: null,
          meta: {
            result: serializedResult.meta,
          },
        }
        const cookies: Array<string> = []
        ;((res as any).blitzCtx.session.$headers() as Headers).forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") {
            cookies.push(value)
          } else {
            res.setHeader(key, value)
          }
        })
        res.setHeader("Set-Cookie", cookies)
        res.status(200).end(JSON.stringify(jsonResult))
      } catch (error: any) {
        const serializedError = handleRpcError({
          error,
          config,
          log: logger.log,
          ctx: (res as any).blitzCtx,
        })
        res.status(200).send({
          result: null,
          error: serializedError.json,
          meta: {
            error: serializedError.meta,
          },
        })
      }
    } else {
      // Everything else is error
      logger.log.warn(`${req.method} method not supported`)
      res.status(404).end()
    }
  }
}

interface RpcQuery {
  query: {
    blitz: string[]
    [key: string]: string | string[]
  }
  meta: {
    params: string | string[]
  }
  params: string | string[]
}

export function rpcRequestHandler(config: RpcConfig) {
  return async function handleRpcRequest(
    request: Request,
    rpcQuery: RpcQuery,
    ctx: Ctx,
  ): Promise<Response> {
    const body = await request.json()
    const resolverMap = await getResolverMap()
    assert(resolverMap, "No query or mutation resolvers found")
    assert(
      Array.isArray(rpcQuery.query.blitz),
      "It seems your Blitz RPC endpoint file is not named [[...blitz]].(jt)s. Please ensure it is",
    )
    const {resolverName, routePath} = parseResolverFromRequest(rpcQuery.query.blitz)
    const logger = initRpcLogger(resolverName)
    const {resolver, resolverConfigWithDefaults} = await loadResolver(resolverMap, routePath)

    if (request.method === "HEAD") {
      // We used to initiate database connection here
      return new Response(null, {status: 200})
    } else if (
      request.method === "POST" ||
      (request.method === "GET" && resolverConfigWithDefaults.httpMethod === "GET")
    ) {
      if (request.method === "POST" && typeof rpcQuery.params === "undefined") {
        const error = {message: "Request body is missing the `params` key"}
        logger.log.error(error.message)
        return new Response(
          JSON.stringify({
            result: null,
            error,
          }),
          {status: 400},
        )
      }
      try {
        const data = deserialize({
          json:
            request.method === "POST"
              ? body.params
              : rpcQuery.params
              ? parse(`${rpcQuery.params}`)
              : undefined,
          meta:
            request.method === "POST"
              ? body.meta?.params
              : rpcQuery.meta
              ? parse(`${rpcQuery.meta}`)
              : undefined,
        })
        const {result, serializedResult} = await executeBlitzResolver({
          resolverName,
          config,
          data,
          resolver,
          ctx,
          ...logger,
        })
        return new Response(
          JSON.stringify({
            result: serializedResult.json,
            error: null,
            meta: {
              result: serializedResult.meta,
            },
            blitzResult: result,
          }),
        )
      } catch (error: any) {
        const serializedError = handleRpcError({error, config, log: logger.log, ctx})
        return new Response(
          JSON.stringify({
            result: null,
            error: serializedError.json,
            meta: {
              error: serializedError.meta,
            },
          }),
          {status: error.statusCode},
        )
      }
    } else {
      // Everything else is error
      logger.log.warn(`${request.method} method not supported`)
      return new Response(null, {status: 404})
    }
  }
}

function initRpcLogger(resolverName: string) {
  const log = baseLogger().getSubLogger({
    name: "blitz-rpc",
    prefix: [resolverName + "()"],
  })
  const customChalk = new chalk.Instance({
    level: log.settings.type === "json" ? 0 : chalk.level,
  })
  return {log, customChalk}
}

async function loadResolver(resolverMap: ResolverFiles | null | undefined, routePath: string) {
  const loadableResolver = resolverMap?.[routePath]
  if (!loadableResolver) {
    throw new Error("No resolver for path: " + routePath)
  }
  const {default: resolver, config} = await loadableResolver.resolver()
  if (!resolver) {
    throw new Error("No default export for resolver path: " + routePath)
  }
  const resolverConfigWithDefaults: ResolverConfig = {...defaultConfig, ...config}
  return {resolver, resolverConfigWithDefaults}
}

async function executeBlitzResolver({
  resolverName,
  config,
  data,
  log,
  customChalk,
  resolver,
  ctx,
}: {
  resolverName: string
  config: RpcConfig
  data: any
  log: ReturnType<typeof initRpcLogger>["log"]
  customChalk: ReturnType<typeof initRpcLogger>["customChalk"]
  resolver: Resolver
  ctx?: Ctx
}) {
  const result = await resolver(data, ctx)
  const serializedResult = superjsonSerialize(result)
  return {result, serializedResult}
}

function handleRpcError({
  error,
  config,
  log,
  ctx,
}: {
  error: any
  config: RpcConfig
  log: ReturnType<typeof initRpcLogger>["log"]
  ctx: Ctx
}) {
  if (error._clearStack) {
    delete error.stack
  }
  config.onError?.(error, ctx)
  log.error(error)
  newLine()
  if (!error.statusCode) {
    error.statusCode = 500
  }
  const formattedError = config.formatError?.(error, ctx) ?? error
  const serializedError = superjsonSerialize(formattedError)
  return serializedError
}

function parseResolverFromRequest(blitz?: string[]) {
  const relativeRoutePath = blitz?.join("/")
  const routePath = "/" + relativeRoutePath
  const resolverName = routePath.replace(/(\/api\/rpc)?\//, "")
  return {resolverName, routePath}
}
