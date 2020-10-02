import {
  QueryFn,
  FirstParam,
  PromiseReturnType,
  Resolver,
  EnhancedResolver,
  EnhancedResolverRpcClient,
} from "./types"
import {isClient} from "./utils"
import {IncomingMessage, ServerResponse} from "http"
import {log} from "@blitzjs/display"
import {
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
  MiddlewareResponse,
  Middleware,
} from "./middleware"

export function invoke<T extends QueryFn, TInput = FirstParam<T>, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: TInput,
) {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "invoke is missing the first argument - it must be a query or mutation function",
    )
  }

  if (isClient) {
    const fn = (queryFn as unknown) as EnhancedResolverRpcClient<TInput, TResult>
    return fn(params, {fromInvoke: true})
  } else {
    const fn = (queryFn as unknown) as EnhancedResolver<TInput, TResult>
    return fn(params) as ReturnType<T>
  }
}

export type InvokeWithMiddlewareConfig = {
  req: IncomingMessage
  res: ServerResponse
  middleware?: Middleware[]
  [prop: string]: any
}

export async function invokeWithMiddleware<TInput, TResult>(
  resolver: Resolver<TInput, TResult>,
  params: TInput,
  ctx: InvokeWithMiddlewareConfig,
): Promise<TResult> {
  if (!ctx.req) {
    throw new Error("You must provide `req` in third argument of invokeWithMiddleware()")
  }
  if (!ctx.res) {
    throw new Error("You must provide `res` in third argument of invokeWithMiddleware()")
  }
  const enhancedResolver = (resolver as unknown) as EnhancedResolver<TInput, TResult>

  const middleware = getAllMiddlewareForModule(enhancedResolver)

  if (ctx.middleware) {
    middleware.push(...ctx.middleware)
  }

  middleware.push(async (_req, res, next) => {
    // TODO - use new logging
    const logPrefix = `${enhancedResolver._meta.name}`
    log.newline()
    try {
      log.progress(`Running ${logPrefix}(${JSON.stringify(params, null, 2)})`)
      const result = await enhancedResolver(params, res.blitzCtx)
      log.success(`${logPrefix} returned ${log.variable(JSON.stringify(result, null, 2))}\n`)
      res.blitzResult = result
      return next()
    } catch (error) {
      log.error(`${logPrefix} failed: ${error}\n`)
      throw error
    }
  })

  await handleRequestWithMiddleware(ctx.req, ctx.res, middleware)

  return (ctx.res as MiddlewareResponse).blitzResult as TResult
}
