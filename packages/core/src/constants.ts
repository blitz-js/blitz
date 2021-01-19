import {getBlitzRuntimeData} from "./blitz-data"

// regarding tokens
export const TOKEN_SEPARATOR = ";"
export const HANDLE_SEPARATOR = ":"
export const SESSION_TYPE_OPAQUE_TOKEN_SIMPLE = "ots"
export const SESSION_TYPE_ANONYMOUS_JWT = "ajwt"
export const SESSION_TOKEN_VERSION_0 = "v0"

export const COOKIE_ANONYMOUS_SESSION_TOKEN = () =>
  `${getBlitzRuntimeData().sessionCookiePrefix}_sAnonymousSessionToken`
export const COOKIE_SESSION_TOKEN = () =>
  `${getBlitzRuntimeData().sessionCookiePrefix}_sSessionToken`
export const COOKIE_REFRESH_TOKEN = () =>
  `${getBlitzRuntimeData().sessionCookiePrefix}_sIdRefreshToken`
export const COOKIE_CSRF_TOKEN = () => `${getBlitzRuntimeData().sessionCookiePrefix}_sAntiCrfToken`
export const COOKIE_PUBLIC_DATA_TOKEN = () =>
  `${getBlitzRuntimeData().sessionCookiePrefix}_sPublicDataToken`

// Headers always all lower case
export const HEADER_CSRF = "anti-csrf"
export const HEADER_PUBLIC_DATA_TOKEN = "public-data-token"
export const HEADER_SESSION_REVOKED = "session-revoked"
export const HEADER_CSRF_ERROR = "csrf-error"

export const LOCALSTORAGE_PREFIX = "_blitz-"
