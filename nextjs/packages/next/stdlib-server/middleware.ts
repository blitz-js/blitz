import { IncomingMessage, ServerResponse } from 'http'
import { Resolver } from '../next-server/server/api-utils'
import {
  getAndValidateMiddleware,
  handleRequestWithMiddleware,
} from '../next-server/server/middleware'
import { prettyMs } from '../server/lib/utils'
import { Middleware, MiddlewareResponse } from '../types'
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
