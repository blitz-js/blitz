import {Middleware, MiddlewareResponse} from "blitz"
import {NextApiRequest} from "next"

export interface MiddlewareRequest extends NextApiRequest {
  protocol?: string
}
export type MiddlewareNext = (error?: Error) => Promise<void> | void

/**
 * If the middleware function doesn't declare receiving the `next` callback
 * assume that it's synchronous and invoke `next` ourselves
 */
function noCallbackHandler(
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
  middleware: Middleware<MiddlewareRequest, MiddlewareResponse>,
) {
  // Cast to any to call with two arguments for connect compatibility
  ;(middleware as any)(req, res)
  return next()
}

/**
 * The middleware function does include the `next` callback so only resolve
 * the Promise when it's called. If it's never called, the middleware stack
 * completion will stall
 */
function withCallbackHandler(
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
  middleware: Middleware<MiddlewareRequest, MiddlewareResponse>,
) {
  return new Promise((resolve, reject) => {
    // Rule doesn't matter since we are inside new Promise()
    //eslint-disable-next-line @typescript-eslint/no-floating-promises
    middleware(req, res, (err) => {
      if (err) reject(err)
      else resolve(next())
    })
  })
}

/**
 * Returns a Blitz middleware function that varies its async logic based on if the
 * given middleware function declares at least 3 parameters, i.e. includes
 * the `next` callback function
 */
export function connectMiddleware(
  middleware: Middleware<MiddlewareRequest, MiddlewareResponse>,
): Middleware<MiddlewareRequest, MiddlewareResponse> {
  const handler = middleware.length < 3 ? noCallbackHandler : withCallbackHandler
  return function connectHandler(req: MiddlewareRequest, res, next) {
    return handler(req, res, next, middleware)
  } as Middleware<MiddlewareRequest, MiddlewareResponse>
}
