import { IncomingMessage, ServerResponse } from 'http'
import { Resolver } from '../next-server/server/api-utils'
import {
  getAndValidateMiddleware,
  handleRequestWithMiddleware,
} from '../next-server/server/middleware'
import { prettyMs } from '../server/lib/utils'
import {
  Middleware,
  MiddlewareNext,
  MiddlewareRequest,
  MiddlewareResponse,
  ConnectMiddleware,
} from '../next-server/lib/utils'
import { loadConfigAtRuntime } from '../next-server/server/config-shared'
import chalk from 'chalk'
import { interopDefault } from '../next-server/server/load-components'

export type InvokeWithMiddlewareConfig = {
  req: IncomingMessage
  res: ServerResponse
  middleware?: Middleware[]
  [prop: string]: any
}

interface ResolverModule<TInput, TResult> extends Record<any, any> {
  default: Resolver<TInput, TResult>
  middleware?: Middleware[]
}

export async function invokeWithMiddleware<TInput, TResult>(
  resolver: ResolverModule<TInput, TResult>,
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

  const config = await loadConfigAtRuntime()
  const middleware = getAndValidateMiddleware(
    config,
    resolver,
    'unknown'
    // TODO fix
    // resolver._meta.name
  )

  if (ctx.middleware) {
    middleware.push(...ctx.middleware)
  }

  middleware.push(async (_req, res, next) => {
    // TODO fix
    // const log = baseLogger().getChildLogger({
    //   prefix: [resolver._meta.name + '()'],
    // })
    // displayLog.newline()
    try {
      // log.info(chalk.dim('Starting with input:'), params)
      console.log(chalk.dim('Starting with input:'), params)
      const startTime = Date.now()

      const result = await interopDefault(resolver)(params, res.blitzCtx)

      const duration = Date.now() - startTime
      // log.info(chalk.dim(`Finished in ${prettyMs(duration)}`))
      console.log(chalk.dim(`Finished in ${prettyMs(duration)}\n`))
      // displayLog.newline()

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
  return function connectHandler(req, res, next) {
    return handler(req, res, next, middleware)
  } as Middleware
}

export const secureProxyMiddleware: Middleware = function (
  req: MiddlewareRequest,
  _res: MiddlewareResponse,
  next: (error?: Error) => void
) {
  req.protocol = getProtocol(req)
  next()
}

function getProtocol(req: MiddlewareRequest) {
  // @ts-ignore
  // For some reason there is no encrypted on socket while it is expected
  if (req.connection.encrypted) {
    return 'https'
  }
  const forwardedProto =
    req.headers && (req.headers['x-forwarded-proto'] as string)
  if (forwardedProto) {
    return forwardedProto.split(/\s*,\s*/)[0]
  }
  return 'http'
}
