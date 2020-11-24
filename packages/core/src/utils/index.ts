import {IncomingMessage} from "http"
import {BlitzApiRequest} from "../"

export const isServer = typeof window === "undefined"
export const isClient = typeof window !== "undefined"

export function isLocalhost(req: BlitzApiRequest | IncomingMessage): boolean {
  let {host} = req.headers
  let localhost = false
  if (host) {
    host = host.split(":")[0]
    localhost = host === "localhost"
  }
  return localhost
}

export function clientDebug(...args: any) {
  if (typeof window !== "undefined" && (window as any)["DEBUG_BLITZ"]) {
    console.log("[BLITZ]", ...args)
  }
}
