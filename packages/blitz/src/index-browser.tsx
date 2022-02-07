import {parse} from "cookie"

export function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

// todo: type + where should it go?
export function isLocalhost(req: any): boolean {
  let {host} = req.headers
  let localhost = false
  if (host) {
    host = host.split(":")[0]
    localhost = host === "localhost"
  }
  return localhost
}

// todo: should that go to next? as it returns NextApiRequestCookies
/**
 * Parse cookies from the `headers` of request
 * @param req request object
 */
export function getCookieParser(headers: {
  [key: string]: undefined | string | string[]
}) {
  return function parseCookie() {
    const header: undefined | string | string[] = headers.cookie

    if (!header) {
      return {}
    }

    return parse(Array.isArray(header) ? header.join(";") : header)
  }
}
