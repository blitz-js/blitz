import { fromBase64 } from 'b64-lite'
import BadBehavior from 'bad-behavior'
import {
  COOKIE_CSRF_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  LOCALSTORAGE_PREFIX,
} from './constants'
import {
  deleteCookie,
  readCookie,
  AuthenticationError,
  RedirectError,
  isServer,
  isClient,
} from '../stdlib/index'
import {
  PublicData,
  EmptyPublicData,
  AuthenticatedClientSession,
  ClientSession,
} from '../next-server/lib/utils'
import { useEffect, useState } from 'react'
import { UrlObject } from 'url'

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export const parsePublicDataToken = (token: string) => {
  assert(token, '[parsePublicDataToken] Failed: token is empty')

  const publicDataStr = fromBase64(token)
  try {
    const publicData: PublicData = JSON.parse(publicDataStr)
    return {
      publicData,
    }
  } catch (error) {
    throw new Error(
      `[parsePublicDataToken] Failed to parse publicDataStr: ${publicDataStr}`
    )
  }
}

class PublicDataStore {
  private eventKey = `${LOCALSTORAGE_PREFIX}publicDataUpdated`
  readonly emptyPublicData: EmptyPublicData = { userId: null }
  readonly observable = BadBehavior<PublicData | EmptyPublicData>()

  constructor() {
    if (typeof window !== 'undefined') {
      // Set default value & prevent infinite loop
      this.updateState(undefined, { suppressEvent: true })
      window.addEventListener('storage', (event) => {
        if (event.key === this.eventKey) {
          // Prevent infinite loop
          this.updateState(undefined, { suppressEvent: true })
        }
      })
    }
  }

  updateState(
    value?: PublicData | EmptyPublicData,
    opts?: { suppressEvent: boolean }
  ) {
    // We use localStorage as a message bus between tabs.
    // Setting the current time in ms will cause other tabs to receive the `storage` event
    if (!opts?.suppressEvent) {
      // Prevent infinite loop
      try {
        localStorage.setItem(this.eventKey, Date.now().toString())
      } catch (err) {
        console.error('LocalStorage is not available', err)
      }
    }
    this.observable.next(value ?? this.getData())
  }

  clear() {
    deleteCookie(COOKIE_PUBLIC_DATA_TOKEN())
    this.updateState(this.emptyPublicData)
  }

  getData() {
    const publicDataToken = this.getToken()
    if (!publicDataToken) {
      return this.emptyPublicData
    }

    const { publicData } = parsePublicDataToken(publicDataToken)
    return publicData
  }

  private getToken() {
    return readCookie(COOKIE_PUBLIC_DATA_TOKEN())
  }
}
export const getPublicDataStore = (): PublicDataStore => {
  if (!(window as any).__publicDataStore) {
    ;(window as any).__publicDataStore = new PublicDataStore()
  }
  return (window as any).__publicDataStore
}

export const getAntiCSRFToken = () => readCookie(COOKIE_CSRF_TOKEN())

interface UseSessionOptions {
  initialPublicData?: PublicData
  suspense?: boolean | null
}

export const useSession = (options: UseSessionOptions = {}): ClientSession => {
  const suspense = options?.suspense ?? process.env.__BLITZ_SUSPENSE_ENABLED

  let initialState: ClientSession
  if (options.initialPublicData) {
    initialState = { ...options.initialPublicData, isLoading: false }
  } else if (suspense) {
    if (isServer) {
      throw new Promise((_) => {})
    } else {
      initialState = { ...getPublicDataStore().getData(), isLoading: false }
    }
  } else {
    initialState = { ...getPublicDataStore().emptyPublicData, isLoading: true }
  }

  const [session, setSession] = useState(initialState)

  useEffect(() => {
    // Initialize on mount
    setSession({ ...getPublicDataStore().getData(), isLoading: false })
    const subscription = getPublicDataStore().observable.subscribe((data) =>
      setSession({ ...data, isLoading: false })
    )
    return subscription.unsubscribe
  }, [])

  return session
}

export const useAuthenticatedSession = (
  options: UseSessionOptions = {}
): AuthenticatedClientSession => {
  useAuthorize()
  return useSession(options) as AuthenticatedClientSession
}

export const useAuthorize = () => {
  useAuthorizeIf(true)
}

export const useAuthorizeIf = (condition?: boolean) => {
  if (isClient && condition && !getPublicDataStore().getData().userId) {
    const error = new AuthenticationError()
    error.stack = null!
    throw error
  }
}

export const useRedirectAuthenticated = (to: UrlObject | string) => {
  if (isClient && getPublicDataStore().getData().userId) {
    const error = new RedirectError(to)
    error.stack = null!
    throw error
  }
}
