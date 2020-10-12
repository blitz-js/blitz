import {MiddlewareRequest, MiddlewareResponse, Middleware} from "./types"

export const secureProxyMiddleware: Middleware = function (
  req: MiddlewareRequest,
  _res: MiddlewareResponse,
  next: (error?: Error) => void,
) {
  req.protocol = getProtocol(req)
  next()
}

function getProtocol(req: MiddlewareRequest) {
  // @ts-ignore
  // For some reason there is no encrypted on socket while it is expected
  if (req.connection.encrypted) {
    return "https"
  }
  const forwardedProto = req.headers && (req.headers["x-forwarded-proto"] as string)
  if (forwardedProto) {
    return forwardedProto.split(/\s*,\s*/)[0]
  }
  return "http"
}
