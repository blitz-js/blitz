import {ConnectMiddleware} from "middleware"
import {IncomingMessage, ServerResponse} from "http"

export const secureProxyMiddleware: ConnectMiddleware = (
  req: IncomingMessage,
  _res: ServerResponse,
  next: (error?: Error) => void,
) => {
  // @ts-ignore
  // For some reason there is no protocol on IncomingRequest while it is expected
  req.protocol = getProtocol(req)
  next()
}

function getProtocol(req: IncomingMessage) {
  // @ts-ignore
  // For some reason there is no encrypted on socket while it is expected
  if (req.connection.encrypted) {
    return "https"
  }
  const forwardedProto = req.headers["x-forwarded-proto"] as string
  if (forwardedProto) {
    return forwardedProto.split(/\s*,\s*/)[0]
  }
  return "http"
}
