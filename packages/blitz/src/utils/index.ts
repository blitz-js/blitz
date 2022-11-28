import {RequestMiddleware} from "../index-server"

export function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export const isServer = typeof window === "undefined"
export const isClient = typeof window !== "undefined"

const MILLISECONDS_IN_MINUTE = 60000
const MINUTES_IN_YEAR = 525960

function toInteger(dirtyNumber: unknown) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN
  }

  const number = Number(dirtyNumber)

  if (isNaN(number)) {
    return number
  }

  return number < 0 ? Math.ceil(number) : Math.floor(number)
}

export const isPast = (date: Date) => {
  return date.getTime() < Date.now()
}

export function differenceInMilliseconds(dateLeft: Date, dateRight: Date) {
  return dateLeft.getTime() - dateRight.getTime()
}

export function differenceInMinutes(dateLeft: Date, dateRight: Date) {
  const diff = differenceInMilliseconds(dateLeft, dateRight) / MILLISECONDS_IN_MINUTE
  return diff > 0 ? Math.floor(diff) : Math.ceil(diff)
}

export function addMilliseconds(date: Date, amount: number): Date {
  const timestamp = date.getTime()
  const cleanAmount = toInteger(amount)
  return new Date(timestamp + cleanAmount)
}

export function addMinutes(date: Date, amount: number): Date {
  const cleanAmount = toInteger(amount)
  return addMilliseconds(date, cleanAmount * MILLISECONDS_IN_MINUTE)
}

export function addYears(date: Date, amount: number): Date {
  const cleanAmount = toInteger(amount)
  return addMinutes(date, cleanAmount * MINUTES_IN_YEAR)
}

// Taken from https://github.com/HenrikJoreteg/cookie-getter
// simple commonJS cookie reader, best perf according to http://jsperf.com/cookie-parsing
export function readCookie(name: string) {
  if (typeof document === "undefined") return null
  const cookie = document.cookie
  const setPos = cookie.search(new RegExp("\\b" + name + "="))
  const stopPos = cookie.indexOf(";", setPos)
  let res
  if (!~setPos) return null
  res = decodeURIComponent(
    cookie.substring(setPos, ~stopPos ? stopPos : undefined).split("=")[1] || "",
  )
  return res.charAt(0) === "{" ? JSON.parse(res) : res
}

export const setCookie = (name: string, value: string, expires: string) => {
  const result = `${name}=${value};path=/;expires=${expires}`
  document.cookie = result
}
export const deleteCookie = (name: string) => setCookie(name, "", "Thu, 01 Jan 1970 00:00:01 GMT")

export function compose(middleware: RequestMiddleware<any, any, any>[]) {
  if (!Array.isArray(middleware)) {
    throw new TypeError("Middleware stack must be an array!")
  }

  for (const handler of middleware) {
    if (typeof handler !== "function") {
      throw new TypeError("Middleware must be composed of functions!")
    }
  }

  // Return a single middleware function that composes everything passed in
  return function (req, res, next): Promise<any> {
    // last called middleware #
    let index = -1

    function dispatch(i: number, error?: any): Promise<void> {
      if (error) {
        return Promise.reject(error)
      }

      if (i <= index) throw new Error("next() called multiple times")
      index = i

      let handler = middleware[i]
      if (!handler) {
        return Promise.resolve()
      }

      try {
        return Promise.resolve(handler(req, res, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }

    // return next(result as any)
    return dispatch(0).then(next as any)
  } as RequestMiddleware
}

function round(num: number, decimalPlaces: number) {
  const p = Math.pow(10, decimalPlaces)
  const m = num * p * (1 + Number.EPSILON)
  return Math.round(m) / p
}

/**
 * Formats milliseconds to a string
 * If more than 1s, it'll return seconds instead
 * @example
 * prettyMs(100) // -> `100ms`
 * prettyMs(1200) // -> `1.2s`
 * @param ms
 */
export function prettyMs(ms: number): string {
  if (Math.abs(ms) >= 1000) {
    return `${round(ms / 1000, 1)}s`
  }
  return `${ms}ms`
}

export function interopDefault(mod: any) {
  return mod.default || mod
}

export function truncateString(str: string, maxLength: number): string {
  return str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str
}
