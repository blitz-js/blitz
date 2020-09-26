import {QueryKey} from "react-query"
import {BlitzApiRequest} from "../"
import {IncomingMessage} from "http"

export const isServer = typeof window === "undefined"
export const isClient = typeof window !== "undefined"

export function getQueryKey(cacheKey: string, params: any): readonly [string, ...QueryKey[]] {
  return [cacheKey, typeof params === "function" ? (params as Function)() : params]
}

export function isLocalhost(req: BlitzApiRequest | IncomingMessage): boolean {
  let {host} = req.headers
  let localhost = false
  if (host) {
    host = host.split(":")[0]
    localhost = host === "localhost"
  }
  return localhost
}
