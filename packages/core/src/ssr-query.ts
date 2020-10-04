import {log} from "@blitzjs/display"
import {InferUnaryParam, QueryFn, SsrQueryContext} from "./types"
import {
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
  MiddlewareResponse,
} from "./middleware"
import {EnhancedResolverModule} from "./rpc"

export async function ssrQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T>,
  {req, res}: SsrQueryContext,
): Promise<ReturnType<T>> {
  const handler = (queryFn as unknown) as EnhancedResolverModule

  const middleware = getAllMiddlewareForModule(handler)

  middleware.push(async (_req, res, next) => {
    const logPrefix = `${handler._meta.name}`
    log.newline()
    try {
      log.progress(`Running ${logPrefix}(${JSON.stringify(params, null, 2)})`)
      const result = await handler(params, res.blitzCtx)
      log.success(`${logPrefix} returned ${log.variable(JSON.stringify(result, null, 2))}\n`)
      res.blitzResult = result
      return next()
    } catch (error) {
      log.error(`${logPrefix} failed: ${error}\n`)
      throw error
    }
  })

  await handleRequestWithMiddleware(req, res, middleware)

  return (res as MiddlewareResponse).blitzResult as ReturnType<T>
}
