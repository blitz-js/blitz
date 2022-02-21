import {UrlObject} from "url"

export const urlObjectKeys = [
  "auth",
  "hash",
  "host",
  "hostname",
  "href",
  "path",
  "pathname",
  "port",
  "protocol",
  "query",
  "search",
  "slashes",
]

export function formatWithValidation(url: UrlObject): string {
  if (process.env.NODE_ENV === "development") {
    if (url !== null && typeof url === "object") {
      Object.keys(url).forEach((key) => {
        if (urlObjectKeys.indexOf(key) === -1) {
          console.warn(`Unknown key passed via urlObject into url.format: ${key}`)
        }
      })
    }
  }

  return formatUrl(url)
}

import {ParsedUrlQuery} from "querystring"

function stringifyUrlQueryParam(param: string): string {
  if (
    typeof param === "string" ||
    (typeof param === "number" && !isNaN(param)) ||
    typeof param === "boolean"
  ) {
    return String(param)
  } else {
    return ""
  }
}

export function urlQueryToSearchParams(urlQuery: ParsedUrlQuery): URLSearchParams {
  const result = new URLSearchParams()
  Object.entries(urlQuery).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => result.append(key, stringifyUrlQueryParam(item)))
    } else {
      result.set(key, stringifyUrlQueryParam(value!)) //blitz
    }
  })
  return result
}

const slashedProtocols = /https?|ftp|gopher|file/

export function formatUrl(urlObj: UrlObject) {
  let {auth, hostname} = urlObj
  let protocol = urlObj.protocol || ""
  let pathname = urlObj.pathname || ""
  let hash = urlObj.hash || ""
  let query = urlObj.query || ""
  let host: string | false = false

  auth = auth ? encodeURIComponent(auth).replace(/%3A/i, ":") + "@" : ""

  if (urlObj.host) {
    host = auth + urlObj.host
  } else if (hostname) {
    host = auth + (~hostname.indexOf(":") ? `[${hostname}]` : hostname)
    if (urlObj.port) {
      host += ":" + urlObj.port
    }
  }

  if (query && typeof query === "object") {
    query = String(urlQueryToSearchParams(query as ParsedUrlQuery))
  }

  let search = urlObj.search || (query && `?${query}`) || ""

  if (protocol && protocol.substr(-1) !== ":") protocol += ":"

  if (urlObj.slashes || ((!protocol || slashedProtocols.test(protocol)) && host !== false)) {
    host = "//" + (host || "")
    if (pathname && pathname[0] !== "/") pathname = "/" + pathname
  } else if (!host) {
    host = ""
  }

  if (hash && hash[0] !== "#") hash = "#" + hash
  if (search && search[0] !== "?") search = "?" + search

  pathname = pathname.replace(/[?#]/g, encodeURIComponent)
  search = search.replace("#", "%23")

  return `${protocol}${host}${pathname}${search}${hash}`
}
