import {
  BlitzApiRequest,
  BlitzApiResponse,
  EnhancedResolver,
  handleRequestWithMiddleware,
  Middleware,
  prettyMs,
} from "@blitzjs/core"
import {baseLogger, log as displayLog} from "@blitzjs/display"
import chalk from "chalk"
import {deserialize, serialize} from "superjson"

const rpcMiddleware = <TInput, TResult>(
  resolver: EnhancedResolver<TInput, TResult>,
  connectDb?: () => any,
): Middleware => {
  return async (req, res, next) => {
    const log = baseLogger().getChildLogger({prefix: [resolver._meta.name + "()"]})

    if (req.method === "HEAD") {
      // Warm the lamda and connect to DB
      if (typeof connectDb === "function") {
        connectDb()
      }
      res.status(200).end()
      return next()
    } else if (req.method === "POST") {
      // Handle RPC call

      if (typeof req.body.params === "undefined") {
        const error = {message: "Request body is missing the `params` key"}
        log.error(error.message)
        res.status(400).json({
          result: null,
          error,
        })
        return next()
      }

      try {
        const data = deserialize({json: req.body.params, meta: req.body.meta?.params}) as TInput

        log.info(chalk.dim("Starting with input:"), data ? data : JSON.stringify(data))
        const startTime = Date.now()

        const result = await resolver(data, res.blitzCtx)

        const duration = Date.now() - startTime
        log.debug(chalk.dim("Result:"), result ? result : JSON.stringify(result))
        log.info(chalk.dim(`Finished in ${prettyMs(duration)}`))
        displayLog.newline()

        res.blitzResult = result

        const serializedResult = serialize(result)

        res.json({
          result: serializedResult.json,
          error: null,
          meta: {
            result: serializedResult.meta,
          },
        })
        return next()
      } catch (error) {
        if (error._clearStack) {
          delete error.stack
        }
        log.error(error)
        displayLog.newline()

        if (!error.statusCode) {
          error.statusCode = 500
        }

        const serializedError = serialize(error)

        res.json({
          result: null,
          error: serializedError.json,
          meta: {
            error: serializedError.meta,
          },
        })
        return next()
      }
    } else {
      // Everything else is error
      log.warn(`${req.method} method not supported`)
      res.status(404).end()
      return next()
    }
  }
}

export function rpcApiHandler<TInput, TResult>(
  resolver: EnhancedResolver<TInput, TResult>,
  middleware: Middleware[] = [],
  connectDb?: () => any,
) {
  // RPC Middleware is always the last middleware to run
  middleware.push(rpcMiddleware(resolver, connectDb))

  return (req: BlitzApiRequest, res: BlitzApiResponse) => {
    return handleRequestWithMiddleware(req, res, middleware, {
      throwOnError: false,
    })
  }
}
