import { IncomingMessage, ServerResponse } from 'http'
import {
  getAndValidateMiddleware,
  handleRequestWithMiddleware,
} from '../server/middleware'
import { prettyMs } from '../server/lib/utils'
import {
  Middleware,
  MiddlewareNext,
  MiddlewareRequest,
  MiddlewareResponse,
  ConnectMiddleware,
} from '../shared/lib/utils'
import { loadConfigAtRuntime } from '../server/config-shared'
import chalk from 'chalk'
import { interopDefault } from '../server/load-components'
import { AsyncFunc, FirstParam, PromiseReturnType } from '../types/utils'
import { baseLogger, newline } from '../server/lib/logging'
import { RpcResolver } from '../data-client/rpc'

export type InvokeWithMiddlewareConfig = {
  req: IncomingMessage
  res: ServerResponse
  middleware?: Middleware[]
  [prop: string]: any
}

export async function invokeWithMiddleware<
  T extends AsyncFunc,
  TInput = FirstParam<T>,
  TResult = PromiseReturnType<T>
>(
  resolver: T,
  params: TInput,
  ctx: InvokeWithMiddlewareConfig
): Promise<TResult> {
  if (!ctx.req) {
    throw new Error(
      'You must provide `req` in third argument of invokeWithMiddleware()'
    )
  }
  if (!ctx.res) {
    throw new Error(
      'You must provide `res` in third argument of invokeWithMiddleware()'
    )
  }

  const rpcResolver = (resolver as unknown) as RpcResolver

  // can be .default._resolverName when user imports with `* as resolver`
  const resolverName =
    rpcResolver._resolverName ?? (rpcResolver as any).default?._resolverName

  const config = loadConfigAtRuntime()
  const middleware = getAndValidateMiddleware(config, rpcResolver, resolverName)

  if (ctx.middleware) {
    middleware.push(...ctx.middleware)
  }

  middleware.push(async (_req, res, next) => {
    const log = baseLogger().getChildLogger({
      prefix: [resolverName + '()'],
    })
    newline()
    try {
      log.info(chalk.dim('Starting with input:'), params)
      const startTime = Date.now()

      const result = await interopDefault(rpcResolver)(params, res.blitzCtx)

      const duration = Date.now() - startTime
      log.info(chalk.dim(`Finished in ${prettyMs(duration)}`))
      newline()

      res.blitzResult = result
      return next()
    } catch (error) {
      throw error
    }
  })

  await handleRequestWithMiddleware(ctx.req, ctx.res, middleware)

  return (ctx.res as MiddlewareResponse).blitzResult as TResult
}

/**
 * If the middleware function doesn't declare receiving the `next` callback
 * assume that it's synchronous and invoke `next` ourselves
 */
function noCallbackHandler(
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
  middleware: ConnectMiddleware
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
  middleware: ConnectMiddleware
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
  const handler =
    middleware.length < 3 ? noCallbackHandler : withCallbackHandler
  return function connectHandler(req: MiddlewareRequest, res, next) {
    return handler(req, res, next, middleware)
  } as Middleware
}

export const secureProxyMiddleware: Middleware = function (
  req: MiddlewareRequest,
  _res: MiddlewareResponse,
  next: (error?: Error) => void
) {
  req.protocol = 'https'
  next()
}
