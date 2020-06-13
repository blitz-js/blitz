import {BlitzApiRequest, BlitzApiResponse} from '.'
import {IncomingMessage, ServerResponse} from 'http'
import {EnhancedResolverModule} from './rpc'
import {getConfig} from '@blitzjs/config'

export interface MiddlewareRequest extends BlitzApiRequest {}
export interface MiddlewareResponse extends BlitzApiResponse {
  blitzCtx: Record<string, unknown>
  blitzResult: unknown
}
export type MiddlewareNext = (error?: Error) => Promise<void> | void

export type Middleware = (
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
) => Promise<void> | void

export type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: Error) => void,
) => void

export type ResolverModule = {
  default: (args: any, ctx: any) => Promise<unknown>
  middleware?: Middleware[]
}

export function getAllMiddlewareForModule(resolverModule: EnhancedResolverModule) {
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
  opts: {finishRequest: boolean} = {finishRequest: true},
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
    if (opts.finishRequest && !res.writableEnded) {
      res.end()
    }
  } catch (error) {
    console.log('') // new line
    if (res.writableFinished) {
      require('@blitzjs/display').log.error(
        'Error occured in middleware after the response was already sent to the browser:\n',
      )
    } else {
      if (opts.finishRequest) {
        res.statusCode = (error as any).code || (error as any).status || 500
        res.end(error.message || res.statusCode.toString())
      }
      require('@blitzjs/display').log.error('Error while processing the request:\n')
    }
    throw error
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

    function dispatch(i: number): Promise<void> {
      if (i <= index) throw new Error('next() called multiple times')
      index = i

      let handler = middleware[i]
      if (!handler) {
        return Promise.resolve()
      }

      try {
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
 * If the middleware function does declare receiving the `next` callback
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
