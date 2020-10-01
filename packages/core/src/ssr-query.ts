import {IncomingMessage, ServerResponse} from "http"
import {log} from "@blitzjs/display"
import {Resolver, EnhancedResolver} from "./types"
import {
  getAllMiddlewareForModule,
  handleRequestWithMiddleware,
  MiddlewareResponse,
} from "./middleware"

export type SsrQueryContext = {
  req: IncomingMessage
  res: ServerResponse
}

export async function ssrQuery<TInput, TResult>(
  resolver: Resolver<TInput, TResult>,
  params: TInput,
  {req, res}: SsrQueryContext,
): Promise<TResult> {
  const enhancedResolver = (resolver as unknown) as EnhancedResolver<TInput, TResult>

  const middleware = getAllMiddlewareForModule(enhancedResolver)

  middleware.push(async (_req, res, next) => {
    const logPrefix = `${enhancedResolver._meta.name}`
    log.newline()
    try {
      log.progress(`Running ${logPrefix}(${JSON.stringify(params, null, 2)})`)
      const result = await enhancedResolver(params, res.blitzCtx)
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
