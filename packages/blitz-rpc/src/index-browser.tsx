import "./global"
import {assert, createClientPlugin, readCookie} from "blitz"
import {DefaultOptions, QueryClient} from "@tanstack/react-query"
import cookie from "cookie"
import {IncomingMessage, ServerResponse} from "http"

export * from "./data-client/index"

interface CookieOptions {
  prefix?: string
  csrfToken?: string
  domain?: string
  secure?: boolean
  sameSite?: "lax" | "strict" | "none"
  expires?: Date
}

interface BlitzRpcOptions {
  reactQueryOptions?: DefaultOptions
  cookieOptions?: CookieOptions
}

const setCookie = (cookieStr: string) => {
  const getCookieName = (c: string) => c.split("=", 2)[0]
  const appendCookie = () => (document.cookie = cookieStr)

  const cookieName = getCookieName(cookieStr)

  if (!document.cookie) {
    appendCookie()
    return
  }

  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    if (cookieName === getCookieName(cookies[i] || "")) {
      cookies[i] = cookieStr
      document.cookie = cookies.join(";")
      return
    }
  }
  appendCookie()
}

export function isLocalhost(): boolean {
  let host = window.location.hostname
  let localhost = false
  if (host) {
    host = host.split(":")[0] as string
    localhost = host === "localhost"
  }
  return localhost
}

export const setCSRFCookie = (options: CookieOptions) => {
  const {prefix = "BlitzRPC", csrfToken, domain, expires, sameSite, secure} = options || {}
  assert(csrfToken !== undefined, "Internal error: antiCSRFToken is being set to undefined")
  setCookie(
    cookie.serialize(`${prefix}_sAntiCsrfToken`, csrfToken, {
      path: "/",
      secure: secure || !isLocalhost(),
      domain: domain || window.location.hostname,
      sameSite: sameSite || "lax",
      expires: expires || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
    }),
  )
}

export const getAntiCSRFToken = (options: CookieOptions) => {
  const {prefix = "BlitzRPC"} = options
  const cookieValue = readCookie(`${prefix}_sAntiCsrfToken`)
  if (cookieValue) {
    localStorage.setItem(`${prefix}_sAntiCsrfToken`, cookieValue)
    return cookieValue
  } else {
    return localStorage.getItem(`${prefix}_sAntiCsrfToken`)
  }
}

export const BlitzRpcPlugin = createClientPlugin<BlitzRpcOptions, {queryClient: QueryClient}>(
  (options?: BlitzRpcOptions) => {
    const initializeQueryClient = () => {
      const {reactQueryOptions} = options || {}
      let suspenseEnabled = reactQueryOptions?.queries?.suspense ?? true
      if (!process.env.CLI_COMMAND_CONSOLE && !process.env.CLI_COMMAND_DB) {
        globalThis.__BLITZ_SUSPENSE_ENABLED = suspenseEnabled
      }
      // set the cookie on the client
      globalThis.__BLITZ_COOKIE_OPTIONS = options?.cookieOptions
      if (typeof window !== "undefined") {
        if (
          !globalThis.__BLITZ_AUTH_ENABLED &&
          options &&
          options.cookieOptions &&
          options.cookieOptions.csrfToken
        ) {
          setCSRFCookie(options.cookieOptions)
        }
      }
      return new QueryClient({
        defaultOptions: {
          ...reactQueryOptions,
          queries: {
            ...(typeof window === "undefined" && {cacheTime: 0}),
            retry: (failureCount: number, error: any) => {
              if (process.env.NODE_ENV !== "production") return false

              // Retry (max. 3 times) only if network error detected
              if (error.message === "Network request failed" && failureCount <= 3) return true

              return false
            },
            ...reactQueryOptions?.queries,
            suspense: suspenseEnabled,
          },
        },
      })
    }
    const queryClient = initializeQueryClient()
    globalThis.queryClient = queryClient
    return {
      events: {},
      middleware: {},
      exports: () => ({
        queryClient,
      }),
    }
  },
)
