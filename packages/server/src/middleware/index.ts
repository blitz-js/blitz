import {Middleware, MiddlewareResponse, BlitzApiRequest, BlitzApiResponse} from '@blitzjs/core'

export async function runMiddleware(
  req: BlitzApiRequest,
  res: BlitzApiResponse,
  middleware: Middleware | Middleware[],
) {
  try {
    ;(res as MiddlewareResponse).blitzCtx = {}

    let handler: Middleware
    if (Array.isArray(middleware)) {
      handler = compose(middleware)
    } else {
      handler = middleware
    }

    await handler(req, res as MiddlewareResponse, (error) => {
      console.log('top level next', error)
      if (error) {
        console.log('throwing error', error)
        throw error
      } else {
        if (!res.writableEnded) {
          res.end()
        }
      }
    })
  } catch (error) {
    // console.log('Caught error', error)
    console.log('before throw', res.writableFinished, res.statusCode)
    if (res.writableFinished) {
      console.log(error)
      throw new Error('Error occured in middleware after the response was already sent to the browser')
    } else {
      res.statusCode = (error as any).code || (error as any).status || 500
      res.end(error.message || res.statusCode.toString())
    }
  }
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
  return async function (req, res, next) {
    // last called middleware #
    let index = -1

    let middlewareError

    // Recursive function that calls the first middleware, then second, and so on.
    async function dispatch(i: number) {
      // console.log('dispatch', i)
      if (i <= index) throw new Error('next() called multiple times')
      index = i

      // TODO: there's something goofy here. See logs
      let handler = middleware[i]
      if (!handler) {
        // console.log('No handler, returning')
        return
      }

      try {
        await handler(req, res, async (error) => {
          if (error) {
            middlewareError = error
            // console.log('dispatch error:', error)
          } else {
            // console.log('Calling dispatch from `next`')
            await dispatch(i + 1)
          }
        })
      } catch (error) {
        middlewareError = error
        // console.log('dispatch error:', error)
      }
    }

    await dispatch(0)

    return next(middlewareError)
  }
}
