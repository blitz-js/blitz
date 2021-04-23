import {baseLogger, log as displayLog} from "@blitzjs/display"
import chalk from "chalk"
import {deserialize, serialize} from "superjson"
import {BlitzApiHandler, EnhancedResolver, Middleware} from "../types"
import {prettyMs} from "../utils/pretty-ms"
import {handleRequestWithMiddleware} from "./middleware"

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
        const resolverDuration = Date.now() - startTime
        log.debug(chalk.dim("Result:"), result ? result : JSON.stringify(result))

        const serializerStartTime = Date.now()
        const serializedResult = serialize(result)

        const nextSerializerStartTime = Date.now()
        res.blitzResult = result
        res.json({
          result: serializedResult.json,
          error: null,
          meta: {
            result: serializedResult.meta,
          },
        })
        log.debug(
          chalk.dim(`Next.js serialization:${prettyMs(Date.now() - nextSerializerStartTime)}`),
        )
        const serializerDuration = Date.now() - serializerStartTime
        const duration = Date.now() - startTime

        log.info(
          chalk.dim(
            `Finished: resolver:${prettyMs(resolverDuration)} serializer:${prettyMs(
              serializerDuration,
            )} total:${prettyMs(duration)}`,
          ),
        )
        displayLog.newline()

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
): BlitzApiHandler {
  // RPC Middleware is always the last middleware to run
  middleware.push(rpcMiddleware(resolver, connectDb))

  return (req, res) => {
    return handleRequestWithMiddleware(req, res, middleware, {
      throwOnError: false,
    })
  }
}
