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

export function runMiddleware(req: BlitzApiRequest, res: BlitzApiResponse, fn: Middleware) {
  ;(res as MiddlewareResponse).blitzCtx = {}
  return new Promise((resolve, reject) => {
    fn(req, res as MiddlewareResponse, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export function compose(middleware: Middleware[]): Middleware {
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware stack must be an array!')
  }

  for (const handler of middleware) {
    if (typeof handler !== 'function') {
      throw new TypeError('Middleware must be composed of functions!')
    }
  }

  return function (req, res, next) {
    // last called middleware #
    let index = -1

    function dispatch(i: number): Promise<any> {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let handler = middleware[i]
      if (i === middleware.length) handler = (next as unknown) as Middleware
      if (!handler) return Promise.resolve()
      try {
        return Promise.resolve(handler(req, res, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return dispatch(0)
  }
}
