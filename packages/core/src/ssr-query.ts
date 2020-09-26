import {IncomingMessage, ServerResponse} from "http"
import {log} from "@blitzjs/display"
import {Resolver} from "./types"
import {
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
  MiddlewareResponse,
} from "./middleware"
import {EnhancedResolverModule} from "./rpc"

type SsrQueryContext = {
  req: IncomingMessage
  res: ServerResponse
}

export async function ssrQuery<TInput, TResult>(
  resolver: Resolver<TInput, TResult>,
  params: TInput,
  {req, res}: SsrQueryContext,
): Promise<TResult> {
  const handler = (resolver as unknown) as EnhancedResolverModule

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

  return (res as MiddlewareResponse).blitzResult as TResult
}
