import {log} from "@blitzjs/display"
import {
  Middleware,
  BlitzApiRequest,
  BlitzApiResponse,
  handleRequestWithMiddleware,
  EnhancedResolverModule,
} from "@blitzjs/core"
import {serializeError} from "serialize-error"

export function rpcApiHandler(
  resolver: EnhancedResolverModule,
  middleware: Middleware[] = [],
  connectDb?: () => any,
) {
  // RPC Middleware is always the last middleware to run
  middleware.push(rpcMiddleware(resolver, connectDb))

  return (req: BlitzApiRequest, res: BlitzApiResponse) => {
    return handleRequestWithMiddleware(req, res, middleware)
  }
}

const rpcMiddleware = (resolver: EnhancedResolverModule, connectDb?: () => any): Middleware => {
  return async (req, res, next) => {
    const logPrefix = `${resolver._meta.name}`

    if (req.method === "HEAD") {
      // Warm the lamda and connect to DB
      if (typeof connectDb === "function") {
        connectDb()
      }
      res.status(200).end()
      return next()
    } else if (req.method === "POST") {
      // Handle RPC call
      console.log("") // New line
      log.progress(`Running ${logPrefix}(${JSON.stringify(req.body?.params, null, 2)})`)

      if (typeof req.body.params === "undefined") {
        const error = {message: "Request body is missing the `params` key"}
        log.error(`${logPrefix} failed: ${JSON.stringify(error)}\n`)
        res.status(400).json({
          result: null,
          error,
        })
        return next()
      }

      try {
        const result = await resolver(req.body.params, res.blitzCtx)

        log.success(`${logPrefix} returned ${log.variable(JSON.stringify(result, null, 2))}\n`)
        res.blitzResult = result
        res.json({
          result,
          error: null,
        })
        return next()
      } catch (error) {
        log.error(`${logPrefix} failed: ${error}\n`)
        res.json({
          result: null,
          error: serializeError(error),
        })
        return next()
      }
    } else {
      // Everything else is error
      log.error(`${logPrefix} not found\n`)
      res.status(404).end()
      return next()
    }
  }
}
