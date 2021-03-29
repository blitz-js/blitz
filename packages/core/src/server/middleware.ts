/* eslint-disable es5/no-es6-methods  -- file only used on the server */
import {getConfig} from "@blitzjs/config"
import {baseLogger, log} from "@blitzjs/display"
import {IncomingMessage, ServerResponse} from "http"
import {
  BlitzApiRequest,
  BlitzApiResponse,
  ConnectMiddleware,
  Ctx,
  EnhancedResolver,
  Middleware,
  MiddlewareNext,
  MiddlewareRequest,
  MiddlewareResponse,
} from "../types"
const debug = require("debug")("blitz:middleware")

export function getAllMiddlewareForModule<TInput, TResult>(
  resolverModule: EnhancedResolver<TInput, TResult>,
) {
  const middleware: Middleware[] = []
  const config = getConfig()
  if (config.middleware) {
    if (!Array.isArray(config.middleware)) {
      throw new Error("'middleware' in blitz.config.js must be an array")
    }
    middleware.push(...config.middleware)
  }
  if (resolverModule.middleware) {
    if (!Array.isArray(resolverModule.middleware)) {
      throw new Error(`'middleware' exported from ${resolverModule._meta.name} must be an array`)
    }
    middleware.push(...resolverModule.middleware)
  }
  return middleware
}

export async function handleRequestWithMiddleware(
  req: BlitzApiRequest | IncomingMessage,
  res: BlitzApiResponse | ServerResponse,
  middleware: Middleware | Middleware[],
  {
    throwOnError = true,
    stackPrintOnError = true,
  }: {
    throwOnError?: boolean
    stackPrintOnError?: boolean
  } = {},
) {
  if (!(res as MiddlewareResponse).blitzCtx) {
    ;(res as MiddlewareResponse).blitzCtx = {} as Ctx
  }
  if (!(res as any)._blitz) {
    ;(res as any)._blitz = {}
  }

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
    log.newline()
    if (req.method === "GET") {
      // This GET method check is so we don't .end() the request for SSR requests
      baseLogger().error("Error while processing the request")
    } else if (res.writableFinished) {
      baseLogger().error(
        "Error occured in middleware after the response was already sent to the browser",
      )
    } else {
      res.statusCode = (error as any).statusCode || (error as any).status || 500
      res.end(error.message || res.statusCode.toString())
      baseLogger().error("Error while processing the request")
    }
    if (error._clearStack) {
      delete error.stack
    }
    if (stackPrintOnError) {
      baseLogger().prettyError(error)
    } else {
      baseLogger().prettyError(error, true, false, false)
    }
    log.newline()
    if (throwOnError) throw error
  }
}

// -------------------------------------------------------------------------------
// This takes an array of middleware and composes them into a single middleware fn
// This is what makes `next()` and `await next()` work
// -------------------------------------------------------------------------------
export function compose(middleware: Middleware[]) {
  if (!Array.isArray(middleware)) {
    throw new TypeError("Middleware stack must be an array!")
  }

  for (const handler of middleware) {
    if (typeof handler !== "function") {
      throw new TypeError("Middleware must be composed of functions!")
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

      if (i <= index) throw new Error("next() called multiple times")
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

    // const result = await dispatch(0)
    // return next(result as any)
    return dispatch(0).then(next as any)
  } as Middleware
}

/**
 * If the middleware function doesn't declare receiving the `next` callback
 * assume that it's synchronous and invoke `next` ourselves
 */
function noCallbackHandler(
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
  middleware: ConnectMiddleware,
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
  middleware: ConnectMiddleware,
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
export function connectMiddleware(middleware: ConnectMiddleware): Middleware {
  const handler = middleware.length < 3 ? noCallbackHandler : withCallbackHandler
  return function connectHandler(req, res, next) {
    return handler(req, res, next, middleware)
  } as Middleware
}
