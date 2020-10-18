import {
  QueryFn,
  FirstParam,
  PromiseReturnType,
  Resolver,
  EnhancedResolver,
  EnhancedResolverRpcClient,
  MiddlewareResponse,
  InvokeWithMiddlewareConfig,
} from "./types"
import {isClient} from "./utils"
import {baseLogger, log as displayLog, chalk} from "@blitzjs/display"
import prettyMs from "pretty-ms"
import {getAllMiddlewareForModule, handleRequestWithMiddleware} from "./middleware"

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
    const log = baseLogger.getChildLogger({prefix: [enhancedResolver._meta.name + "()"]})
    displayLog.newline()
    try {
      log.info(chalk.dim("Starting with input:"), params)
      const startTime = new Date().getTime()

      const result = await enhancedResolver(params, res.blitzCtx)

      const duration = prettyMs(new Date().getTime() - startTime)
      log.info(chalk.dim("Finished", "in", duration))
      displayLog.newline()

      res.blitzResult = result
      return next()
    } catch (error) {
      throw error
    }
  })

  await handleRequestWithMiddleware(ctx.req, ctx.res, middleware)

  return (ctx.res as MiddlewareResponse).blitzResult as TResult
}
