import {IncomingMessage, ServerResponse} from 'http'
import {InferUnaryParam} from './types'
// import {getAllMiddlewareForModule, handleRequestWithMiddleware, MiddlewareResponse} from './middleware'
// import {EnhancedResolverModule} from 'rpc'

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
  // const handler = (queryFn as unknown) as EnhancedResolverModule
  //
  // const middleware = getAllMiddlewareForModule(handler)
  //
  // middleware.push(async (_req, res, next) => {
  //   const result = await handler.default(params, res.blitzCtx)
  //   res.blitzResult = result
  //   return next()
  // })
  //
  // await handleRequestWithMiddleware(req, res, middleware, {finishRequest: false})

  // return (res as MiddlewareResponse).blitzResult as ReturnType<T>
  await console.log(queryFn, params, req, res)
  return null
}
