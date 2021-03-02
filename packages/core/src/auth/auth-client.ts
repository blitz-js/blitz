import {fromBase64} from "b64-lite"
import {useEffect, useState} from "react"
import {getBlitzRuntimeData} from "../blitz-data"
import {COOKIE_CSRF_TOKEN, COOKIE_LEGACY_CSRF_TOKEN} from "../constants"
import {AuthenticationError} from "../errors"
import {isServer} from "../utils"
import {readCookie} from "../utils/cookie"
import {AuthenticatedClientSession, ClientSession, PublicData} from "./auth-types"
import {publicDataStore} from "./public-data-store"

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export const getAntiCSRFToken = () =>
  readCookie(COOKIE_CSRF_TOKEN()) || readCookie(COOKIE_LEGACY_CSRF_TOKEN())

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

interface UseSessionOptions {
  initialPublicData?: PublicData
  suspense?: boolean | null
}

export const useSession = (options: UseSessionOptions = {}): ClientSession => {
  const suspense = options?.suspense ?? getBlitzRuntimeData().suspenseEnabled

  let initialState: ClientSession
  if (options.initialPublicData) {
    initialState = {...options.initialPublicData, isLoading: false}
  } else if (suspense) {
    if (isServer) {
      throw new Promise((_) => {})
    } else {
      initialState = {...publicDataStore.getData(), isLoading: false}
    }
  } else {
    initialState = {...publicDataStore.emptyPublicData, isLoading: true}
  }

  const [session, setSession] = useState(initialState)

  useEffect(() => {
    // Initialize on mount
    setSession({...publicDataStore.getData(), isLoading: false})
    const subscription = publicDataStore.observable.subscribe((data) =>
      setSession({...data, isLoading: false}),
    )
    return subscription.unsubscribe
  }, [])

  return session
}

export const useAuthenticatedSession = (
  options: UseSessionOptions = {},
): AuthenticatedClientSession => {
  useAuthorize()
  return useSession(options) as AuthenticatedClientSession
}

export const useAuthorize = () => {
  useAuthorizeIf(true)
}

export const useAuthorizeIf = (condition?: boolean) => {
  useEffect(() => {
    if (condition && !publicDataStore.getData().userId) {
      const error = new AuthenticationError()
      delete error.stack
      throw error
    }
  })
}

export const useRedirectAuthenticated = (to: string) => {
  if (typeof window !== "undefined" && publicDataStore.getData().userId) {
    window.location.replace(to)
  }
}
