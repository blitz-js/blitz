import {fromBase64} from "b64-lite"
import _BadBehavior from "bad-behavior"
import {
  COOKIE_CSRF_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  LOCALSTORAGE_CSRF_TOKEN,
  LOCALSTORAGE_PREFIX,
  LOCALSTORAGE_PUBLIC_DATA_TOKEN,
  AuthenticationError,
  RedirectError,
  PublicData,
  EmptyPublicData,
  AuthenticatedClientSession,
  ClientSession,
} from "../shared"
import {useEffect, useState} from "react"
import {UrlObject} from "url"
import {AppProps} from "next/app"
import React, {ComponentPropsWithoutRef} from "react"
import {BlitzPage, createClientPlugin} from "@blitzjs/next"
import {assert, deleteCookie, readCookie, isServer, isClient} from "blitz"

const BadBehavior: typeof _BadBehavior =
  "default" in _BadBehavior ? (_BadBehavior as any).default : _BadBehavior

// todo
const debug = (...args: any) => {} // require("debug")("blitz:auth-client")

export const parsePublicDataToken = (token: string) => {
  assert(token, "[parsePublicDataToken] Failed: token is empty")

  const publicDataStr = fromBase64(token)
  try {
    const publicData: PublicData = JSON.parse(publicDataStr)
    return {
      publicData,
    }
  } catch (error) {
    throw new Error(`[parsePublicDataToken] Failed to parse publicDataStr: ${publicDataStr}`)
  }
}

const emptyPublicData: EmptyPublicData = {userId: null}

class PublicDataStore {
  private eventKey = `${LOCALSTORAGE_PREFIX}publicDataUpdated`
  readonly observable = BadBehavior<PublicData | EmptyPublicData>()

  constructor() {
    if (typeof window !== "undefined") {
      // Set default value & prevent infinite loop
      this.updateState(undefined, {suppressEvent: true})
      window.addEventListener("storage", (event) => {
        if (event.key === this.eventKey) {
          // Prevent infinite loop
          this.updateState(undefined, {suppressEvent: true})
        }
      })
    }
  }

  updateState(value?: PublicData | EmptyPublicData, opts?: {suppressEvent: boolean}) {
    // We use localStorage as a message bus between tabs.
    // Setting the current time in ms will cause other tabs to receive the `storage` event
    if (!opts?.suppressEvent) {
      // Prevent infinite loop
      try {
        localStorage.setItem(this.eventKey, Date.now().toString())
      } catch (err) {
        console.error("LocalStorage is not available", err)
      }
    }
    this.observable.next(value ?? this.getData())
  }

  clear() {
    deleteCookie(COOKIE_PUBLIC_DATA_TOKEN())
    localStorage.removeItem(LOCALSTORAGE_PUBLIC_DATA_TOKEN())
    this.updateState(emptyPublicData)
  }

  getData() {
    const publicDataToken = this.getToken()
    if (!publicDataToken) {
      return emptyPublicData
    }

    const {publicData} = parsePublicDataToken(publicDataToken)
    return publicData
  }

  private getToken() {
    const cookieValue = readCookie(COOKIE_PUBLIC_DATA_TOKEN())
    if (cookieValue) {
      localStorage.setItem(LOCALSTORAGE_PUBLIC_DATA_TOKEN(), cookieValue)
      return cookieValue
    } else {
      return localStorage.getItem(LOCALSTORAGE_PUBLIC_DATA_TOKEN())
    }
  }
}
export const getPublicDataStore = (): PublicDataStore => {
  if (!(window as any).__publicDataStore) {
    ;(window as any).__publicDataStore = new PublicDataStore()
  }
  return (window as any).__publicDataStore
}

export const getAntiCSRFToken = () => {
  const cookieValue = readCookie(COOKIE_CSRF_TOKEN())
  if (cookieValue) {
    localStorage.setItem(LOCALSTORAGE_CSRF_TOKEN(), cookieValue)
    return cookieValue
  } else {
    return localStorage.getItem(LOCALSTORAGE_CSRF_TOKEN())
  }
}

interface UseSessionOptions {
  initialPublicData?: PublicData
  suspense?: boolean | null
}

export const useSession = (options: UseSessionOptions = {}): ClientSession => {
  const suspense = options?.suspense ?? Boolean(process.env.__BLITZ_SUSPENSE_ENABLED)

  let initialState: ClientSession
  if (options.initialPublicData) {
    initialState = {...options.initialPublicData, isLoading: false}
  } else if (suspense) {
    if (isServer) {
      throw new Promise((_) => {})
    } else {
      initialState = {...getPublicDataStore().getData(), isLoading: false}
    }
  } else {
    initialState = {...emptyPublicData, isLoading: true}
  }

  const [session, setSession] = useState(initialState)

  useEffect(() => {
    // Initialize on mount
    setSession({...getPublicDataStore().getData(), isLoading: false})
    const subscription = getPublicDataStore().observable.subscribe((data) =>
      setSession({...data, isLoading: false}),
    )
    return subscription.unsubscribe
  }, [])

  return session
}

export const useAuthorizeIf = (condition?: boolean) => {
  if (isClient && condition && !getPublicDataStore().getData().userId) {
    const error = new AuthenticationError()
    error.stack = null!
    throw error
  }
}

export const useAuthorize = () => {
  useAuthorizeIf(true)
}

export const useAuthenticatedSession = (
  options: UseSessionOptions = {},
): AuthenticatedClientSession => {
  useAuthorize()
  return useSession(options) as AuthenticatedClientSession
}

export const useRedirectAuthenticated = (to: UrlObject | string) => {
  if (isClient && getPublicDataStore().getData().userId) {
    const error = new RedirectError(to)
    error.stack = null!
    throw error
  }
}

// todo: move this somewhere
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

export function getAuthValues(Page: BlitzPage, props: ComponentPropsWithoutRef<BlitzPage>) {
  if (!Page) return {}
  let authenticate = Page.authenticate
  let redirectAuthenticatedTo = Page.redirectAuthenticatedTo

  if (authenticate === undefined && redirectAuthenticatedTo === undefined) {
    const layout = Page.getLayout?.(<Page {...props} />)

    if (layout) {
      let currentElement = layout
      while (true) {
        const type = layout.type

        if (type.authenticate !== undefined || type.redirectAuthenticatedTo !== undefined) {
          authenticate = type.authenticate
          redirectAuthenticatedTo = type.redirectAuthenticatedTo
          break
        }

        if (currentElement.props?.children) {
          currentElement = currentElement.props?.children
        } else {
          break
        }
      }
    }
  }

  return {authenticate, redirectAuthenticatedTo}
}

function withBlitzAuthPlugin(Page: BlitzPage) {
  const AuthRoot: BlitzPage = (props: ComponentPropsWithoutRef<BlitzPage>) => {
    useSession({suspense: false})

    let {authenticate, redirectAuthenticatedTo} = getAuthValues(Page, props)

    useAuthorizeIf(authenticate === true)

    if (typeof window !== "undefined") {
      const publicData = getPublicDataStore().getData()

      // We read directly from publicData.userId instead of useSession
      // so we can access userId on first render. useSession is always empty on first render
      if (publicData.userId) {
        debug("[BlitzAuthInnerRoot] logged in")

        if (typeof redirectAuthenticatedTo === "function") {
          redirectAuthenticatedTo = redirectAuthenticatedTo({
            session: publicData,
          })
        }

        if (redirectAuthenticatedTo) {
          const redirectUrl =
            typeof redirectAuthenticatedTo === "string"
              ? redirectAuthenticatedTo
              : formatWithValidation(redirectAuthenticatedTo)

          debug("[BlitzAuthInnerRoot] redirecting to", redirectUrl)
          const error = new RedirectError(redirectUrl)
          error.stack = null!
          throw error
        }
      } else {
        debug("[BlitzAuthInnerRoot] logged out")
        if (authenticate && typeof authenticate === "object" && authenticate.redirectTo) {
          let {redirectTo} = authenticate
          if (typeof redirectTo !== "string") {
            redirectTo = formatWithValidation(redirectTo)
          }

          const url = new URL(redirectTo, window.location.href)
          url.searchParams.append("next", window.location.pathname)
          debug("[BlitzAuthInnerRoot] redirecting to", url.toString())
          const error = new RedirectError(url.toString())
          error.stack = null!
          throw error
        }
      }
    }

    return <Page {...props} />
  }
  for (let [key, value] of Object.entries(Page)) {
    // @ts-ignore
    AuthRoot[key] = value
  }
  if (process.env.NODE_ENV !== "production") {
    AuthRoot.displayName = `BlitzAuthInnerRoot`
  }

  return AuthRoot
}

export interface AuthPluginClientOptions {
  cookiePrefix: string
}

export const AuthClientPlugin = createClientPlugin((options: AuthPluginClientOptions) => {
  // todo: how to avoid that
  process.env.__BLITZ_SESSION_COOKIE_PREFIX = options.cookiePrefix || "blitz"
  return {
    withProvider: withBlitzAuthPlugin,
    events: {
      onSessionCreate: () => {},
      onSessionDestroy: () => {},
      onBeforeRender: (props: AppProps) => {
        console.log(props)
      },
    },
    middleware: {
      beforeHttpRequest: () => {},
      beforeHttpResponse: () => {},
    },
    exports: () => ({
      useSession,
      useAuthorize,
      useAuthorizeIf,
      useRedirectAuthenticated,
      useAuthenticatedSession,
      getAntiCSRFToken,
    }),
  }
})
