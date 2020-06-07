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

export const runner = {}

function runMiddleware(req: MiddlewareRequest, res: MiddlewareResponse, fn: Middleware) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

// Run the middleware
// await runMiddleware(req, res, cors)
