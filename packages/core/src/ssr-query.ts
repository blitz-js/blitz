import {IncomingMessage, ServerResponse} from "http"
import {log} from "@blitzjs/display"
import {InferUnaryParam} from "./types"
import {getMiddlewareForModule, handleRequestWithMiddleware, MiddlewareResponse} from "./middleware"
import {EnhancedResolverModule} from "./rpc"

type QueryFn = (...args: any) => Promise<any>

type SsrQueryContext = {
  req: IncomingMessage
  res: ServerResponse
}

export async function ssrQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T>,
  {req, res}: SsrQueryContext,
): Promise<ReturnType<T>> {
  const handler = (queryFn as unknown) as EnhancedResolverModule

  const middleware = getMiddlewareForModule(handler)

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
