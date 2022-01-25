export const TOKEN_SEPARATOR = ";"
export const HANDLE_SEPARATOR = ":"
export const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = "ots"
export const SESSION_TYPE_ANONYMOUS_JWT = "ajwt"
export const SESSION_TOKEN_VERSION_0 = "v0"

const prefix = () => {
  if (!process.env.__BLITZ_SESSION_COOKIE_PREFIX) {
    throw new Error("Internal Blitz Error: process.env.__BLITZ_SESSION_COOKIE_PREFIX is not set")
  }
  return process.env.__BLITZ_SESSION_COOKIE_PREFIX
}

export const COOKIE_ANONYMOUS_SESSION_TOKEN = () => `${prefix()}_sAnonymousSessionToken`
export const COOKIE_SESSION_TOKEN = () => `${prefix()}_sSessionToken`
export const COOKIE_REFRESH_TOKEN = () => `${prefix()}_sIdRefreshToken`
export const COOKIE_CSRF_TOKEN = () => `${prefix()}_sAntiCsrfToken`
export const COOKIE_PUBLIC_DATA_TOKEN = () => `${prefix()}_sPublicDataToken`

// Headers always all lower case
export const HEADER_CSRF = "anti-csrf"
export const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"
export const HEADER_SESSION_CREATED = "session-created"
export const HEADER_CSRF_ERROR = "csrf-error"

export const LOCALSTORAGE_PREFIX = "_blitz-"
export const LOCALSTORAGE_CSRF_TOKEN = () => `${prefix()}_sAntiCsrfToken`
export const LOCALSTORAGE_PUBLIC_DATA_TOKEN = () => `${prefix()}_sPublicDataToken`
