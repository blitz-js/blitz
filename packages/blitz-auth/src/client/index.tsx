import {fromBase64} from "b64-lite"
import BadBehavior from "bad-behavior"
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

function getAuthValues(Page: BlitzPage, props: ComponentPropsWithoutRef<BlitzPage>) {
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
    const {authenticate, redirectAuthenticatedTo} = getAuthValues(Page, props)

    if (authenticate || redirectAuthenticatedTo) {
      throw new Error("Auth error")
    }

    if (authenticate !== undefined || redirectAuthenticatedTo) {
      // @ts-ignore
      return <Page {...props} suppressFirstRenderFlicker={true} />
    }

    return <Page {...props} />
  }
  for (let [key, value] of Object.entries(Page)) {
    // @ts-ignore
    AuthRoot[key] = value
  }
  if (process.env.NODE_ENV !== "production") {
    AuthRoot.displayName = `BlitzInnerRoot`
  }

  return AuthRoot
}

export interface AuthPluginClientOptions {}

export const AuthClientPlugin = createClientPlugin((options: AuthPluginClientOptions) => {
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
      useSession: () => {
        return {userId: "123"}
      },
    }),
  }
})
