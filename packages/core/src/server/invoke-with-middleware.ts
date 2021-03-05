import {baseLogger, chalk, log as displayLog} from "@blitzjs/display"
import {EnhancedResolver, InvokeWithMiddlewareConfig, MiddlewareResponse, Resolver} from "../types"
import {prettyMs} from "../utils/pretty-ms"
import {getAllMiddlewareForModule, handleRequestWithMiddleware} from "./middleware"

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
    const log = baseLogger().getChildLogger({prefix: [enhancedResolver._meta.name + "()"]})
    displayLog.newline()
    try {
      log.info(chalk.dim("Starting with input:"), params)
      const startTime = Date.now()

      const result = await enhancedResolver(params, res.blitzCtx)

      const duration = Date.now() - startTime
      log.info(chalk.dim(`Finished in ${prettyMs(duration)}`))
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
