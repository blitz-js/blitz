import {IncomingMessage, ServerResponse} from "http"
import {compose, Ctx, RequestMiddleware, MiddlewareNext, MiddlewareResponse} from "./index-server"

export async function handleRequestWithMiddleware<
  Req extends IncomingMessage = IncomingMessage,
  Res extends ServerResponse = ServerResponse,
  MiddlewareResult = void | Promise<void>,
>(
  req: Req,
  res: Res,
  middleware: RequestMiddleware<Req, Res, MiddlewareResult>[],
  {
    throwOnError = true,
    stackPrintOnError = true,
  }: {
    throwOnError?: boolean
    stackPrintOnError?: boolean
  } = {},
) {
  if (!(res as unknown as MiddlewareResponse).blitzCtx) {
    ;(res as unknown as MiddlewareResponse).blitzCtx = {} as Ctx
  }
  if (!(res as any)._blitz) {
    ;(res as any)._blitz = {}
  }

  let handler = compose(middleware)

  try {
    await handler(req, res, (error) => {
      if (error) {
        throw error
      }
    })
  } catch (error: any) {
    console.log("\n")
    if (res.writableFinished) {
      console.error(
        "Error occured in middleware after the response was already sent to the browser",
      )
    } else {
      console.error("Error while processing the request")
    }
    if (error._clearStack) {
      delete error.stack
    }
    // todo: pretty error
    // if (stackPrintOnError) {
    //   console.error(error)
    // } else {
    //   console.error(error, true, false, false)
    // }
    console.error(error)
    console.log("\n")
    if (throwOnError) throw error
  }
}

/**
 * If the middleware function doesn't declare receiving the `next` callback
 * assume that it's synchronous and invoke `next` ourselves
 */
export function noCallbackHandler<
  Req extends IncomingMessage = IncomingMessage,
  Res = MiddlewareResponse,
>(req: Req, res: Res, next: MiddlewareNext, middleware: RequestMiddleware<Req, Res>) {
  // Cast to any to call with two arguments for connect compatibility
  ;(middleware as any)(req, res)
  return next()
}

/**
 * The middleware function does include the `next` callback so only resolve
 * the Promise when it's called. If it's never called, the middleware stack
 * completion will stall
 */
export function withCallbackHandler<
  Req extends IncomingMessage = IncomingMessage,
  Res = MiddlewareResponse,
>(req: Req, res: Res, next: MiddlewareNext, middleware: RequestMiddleware<Req, Res>) {
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
export function connectMiddleware<
  Req extends IncomingMessage = IncomingMessage,
  Res extends MiddlewareResponse = MiddlewareResponse,
>(middleware: RequestMiddleware<Req, Res>): RequestMiddleware<Req, Res> {
  const handler = middleware.length < 3 ? noCallbackHandler : withCallbackHandler
  return function connectHandler(req: Req, res, next) {
    return handler(req, res, next, middleware)
  } as RequestMiddleware<Req, Res>
}

export const secureProxyMiddleware: RequestMiddleware<
  IncomingMessage & {protocol?: string},
  MiddlewareResponse
> = function (
  req: IncomingMessage & {protocol?: string},
  _res: MiddlewareResponse,
  next: (error?: Error) => void,
) {
  req.protocol = "https"
  next()
}
