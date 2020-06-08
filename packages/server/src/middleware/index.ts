import {BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'

export interface MiddlewareRequest extends BlitzApiRequest {}
export interface MiddlewareResponse extends BlitzApiResponse {
  blitzCtx: Record<string, any>
  blitzResult: any
}
export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type Middleware = (
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
) => Promise<void>

export async function runMiddleware(req: BlitzApiRequest, res: BlitzApiResponse, handler: Middleware) {
  ;(res as MiddlewareResponse).blitzCtx = {}
  await handler(req, res as MiddlewareResponse, () => {})
}

// -------------------------------------------------------------------------------
// This takes an array of middleware and composes them into a single middleware fn
// This is what makes `next()` and `await next()` work
// -------------------------------------------------------------------------------
export function compose(middleware: Middleware[]): Middleware {
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware stack must be an array!')
  }

  for (const handler of middleware) {
    if (typeof handler !== 'function') {
      throw new TypeError('Middleware must be composed of functions!')
    }
  }

  // Return a single middleware function that composes everything passed in
  return async function (req, res, _next) {
    // last called middleware #
    let index = -1

    // Recursive function that calls the first middleware, then second, and so on.
    async function dispatch(i: number) {
      if (i <= index) throw new Error('next() called multiple times')
      index = i

      let handler = middleware[i]
      if (!handler) return

      await handler(req, res, (error) => {
        if (error) throw error
        dispatch(i + 1)
      })
    }

    return await dispatch(0)
  }
}
