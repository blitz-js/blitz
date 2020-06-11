import {
  Middleware,
  MiddlewareRequest,
  MiddlewareResponse,
  BlitzApiRequest,
  BlitzApiResponse,
  MiddlewareNext,
} from '@blitzjs/core'
import {log} from '@blitzjs/display'

export async function runMiddleware(
  req: BlitzApiRequest,
  res: BlitzApiResponse,
  middleware: Middleware | Middleware[],
) {
  ;(res as MiddlewareResponse).blitzCtx = {}

  let handler: Middleware
  if (Array.isArray(middleware)) {
    handler = compose(middleware)
  } else {
    handler = middleware
  }

  try {
    await handler(req as MiddlewareRequest, res as MiddlewareResponse, (error) => {
      if (error) {
        throw error
      }
    })
  } catch (error) {
    console.log('') // new line
    if (res.writableFinished) {
      log.error('Error occured in middleware after the response was already sent to the browser:\n')
    } else {
      res.statusCode = (error as any).code || (error as any).status || 500
      res.end(error.message || res.statusCode.toString())
      log.error('Error while processing the request:\n')
    }
    throw error
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
  return function (req, res, next) {
    // last called middleware #
    let index = -1

    // let middlewareError

    // Recursive function that calls the first middleware, then second, and so on.
    // async function dispatch(i: number) {
    //   console.log('dispatch', i)
    //   if (i <= index) throw new Error('next() called multiple times')
    //   index = i
    //
    //   let handler = middleware[i]
    //   if (!handler) {
    //     console.log('No handler, returning')
    //     return
    //   }
    //   handler = makeConnectCompatible(handler)
    //
    //   try {
    //     await handler(req, res, async (error) => {
    //       if (error) {
    //         middlewareError = error
    //         console.log('dispatch error:', error)
    //       } else {
    //         console.log('Calling dispatch from `next`')
    //         await dispatch(i + 1)
    //       }
    //       console.log('next resolved', i + 1)
    //     })
    //   } catch (error) {
    //     middlewareError = error
    //     // console.log('dispatch error:', error)
    //   }
    // }
    //
    // await dispatch(0)
    // console.log('next resolved 0')
    //
    // return next(middlewareError)

    function dispatch(i: number): Promise<void> {
      // console.log('dispatch', i)
      if (i <= index) throw new Error('next() called multiple times')
      index = i

      let handler = middleware[i]
      if (!handler) {
        // console.log('No handler, returning')
        return Promise.resolve()
      }
      handler = makeConnectCompatible(handler)

      try {
        return Promise.resolve(handler(req, res, dispatch.bind(null, i + 1)))
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return dispatch(0).then(next as any)
  }
}

/**
 * If the middleware function does declare receiving the `next` callback
 * assume that it's synchronous and invoke `next` ourselves
 */
function noCallbackHandler(
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
  middleware: Middleware,
) {
  // Cast to `any` here so we can call middleware with only two arguments.
  // This is for connect middleware compatability
  ;(middleware as any)(req, res)
  return next()
}

/**
 * The middleware function does include the `next` callback so only resolve
 * the Promise when it's called. If it's never called, the middleware stack
 * completion will stall
 */
// function withCallbackHandler(
//   req: MiddlewareRequest,
//   res: MiddlewareResponse,
//   next: MiddlewareNext,
//   middleware: Middleware,
// ) {
//   return new Promise((resolve, reject) => {
//     // Rule doesn't matter since we are inside new Promise()
//     //eslint-disable-next-line @typescript-eslint/no-floating-promises
//     middleware(req, res, (err) => {
//       if (err) reject(err)
//       else resolve(next())
//     })
//   })
// }

/**
 * Returns a Blitz middleware function that varies its async logic based on if the
 * given middleware function declares at least 3 parameters, i.e. includes
 * the `next` callback function
 */
function makeConnectCompatible(middleware: Middleware): Middleware {
  // const handler = middleware.length < 3 ? noCallbackHandler : withCallbackHandler
  // // TODO: investigate the TS error here without the explicit cast
  // return function connectHandler(req, res, next) {
  //   return handler(req, res, next, middleware)
  // } as Middleware

  if (middleware.length < 3) {
    return function connectHandler(req, res, next) {
      return noCallbackHandler(req, res, next, middleware)
    } as Middleware
  } else {
    return middleware
  }
}
