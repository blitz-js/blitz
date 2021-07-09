import { NextApiRequest, NextApiResponse } from '../lib/utils'
// import {baseLogger, log} from "@blitzjs/display"
import { IncomingMessage, ServerResponse } from 'http'
import { NextConfig } from './config-shared'
import {
  Ctx,
  Middleware,
  MiddlewareRequest,
  MiddlewareResponse,
} from '../lib/utils'
const debug = require('debug')('blitz:middleware')

export function getAndValidateMiddleware(
  config: NextConfig,
  resolverModule: any,
  route: string
) {
  const middleware: Middleware[] = []
  if (config.middleware) {
    if (!Array.isArray(config.middleware)) {
      throw new Error("'middleware' in blitz.config.js must be an array")
    }
    middleware.push(...config.middleware)
  }
  if (resolverModule.middleware) {
    if (!Array.isArray(resolverModule.middleware)) {
      throw new Error(`'middleware' exported from ${route} must be an array`)
    }
    middleware.push(...resolverModule.middleware)
  }
  return middleware
}

export async function handleRequestWithMiddleware(
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | ServerResponse,
  middleware: Middleware[],
  {
    throwOnError = true,
    stackPrintOnError = true,
  }: {
    throwOnError?: boolean
    stackPrintOnError?: boolean
  } = {}
) {
  if (!(res as MiddlewareResponse).blitzCtx) {
    ;(res as MiddlewareResponse).blitzCtx = {} as Ctx
  }
  if (!(res as any)._blitz) {
    ;(res as any)._blitz = {}
  }

  let handler = compose(middleware)

  try {
    await handler(
      req as MiddlewareRequest,
      res as MiddlewareResponse,
      (error) => {
        if (error) {
          throw error
        }
      }
    )
  } catch (error) {
    // log.newline()
    if (req.method === 'GET') {
      // This GET method check is so we don't .end() the request for SSR requests
      // baseLogger().error('Error while processing the request')
    } else if (res.writableFinished) {
      // baseLogger().error(
      //   'Error occured in middleware after the response was already sent to the browser'
      // )
    } else {
      res.statusCode = (error as any).statusCode || (error as any).status || 500
      res.end(error.message || res.statusCode.toString())
      // baseLogger().error('Error while processing the request')
    }
    if (error._clearStack) {
      delete error.stack
    }
    if (stackPrintOnError) {
      // baseLogger().prettyError(error)
    } else {
      // baseLogger().prettyError(error, true, false, false)
    }
    // log.newline()
    if (throwOnError) throw error
  }
}

// -------------------------------------------------------------------------------
// This takes an array of middleware and composes them into a single middleware fn
// This is what makes `next()` and `await next()` work
// -------------------------------------------------------------------------------
export function compose(middleware: Middleware[]) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware stack must be an array!')
  }

  for (const handler of middleware) {
    if (typeof handler !== 'function') {
      throw new TypeError('Middleware must be composed of functions!')
    }
  }

  // Return a single middleware function that composes everything passed in
  return function (req, res, next): Promise<any> {
    // last called middleware #
    let index = -1

    function dispatch(i: number, error?: any): Promise<void> {
      if (error) {
        return Promise.reject(error)
      }

      if (i <= index) throw new Error('next() called multiple times')
      index = i

      let handler = middleware[i]
      if (!handler) {
        return Promise.resolve()
      }

      try {
        debug(`[${handler.name}] Starting handler...`)
        return Promise.resolve(handler(req, res, dispatch.bind(null, i + 1)))
      } catch (error) {
        return Promise.reject(error)
      }
    }

    // return next(result as any)
    return dispatch(0).then(next as any)
  } as Middleware
}
