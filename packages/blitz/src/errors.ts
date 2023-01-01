import _SuperJson from "superjson"
import type {UrlObject} from "url"

declare module globalThis {
  let _BLITZ_ERROR_CLASS_REGISTERED: boolean
}

const SuperJson: typeof _SuperJson =
  "default" in _SuperJson ? (_SuperJson as any).default : _SuperJson

const errorProps = ["name", "message", "code", "statusCode", "meta", "url"]
if (process.env.JEST_WORKER_ID === undefined) {
  SuperJson.allowErrorProps(...errorProps)
}

export class AuthenticationError extends Error {
  name = "AuthenticationError"
  statusCode = 401
  constructor(message = "You must be logged in to access this") {
    super(message)
  }
  get _clearStack() {
    return true
  }
}

export class CSRFTokenMismatchError extends Error {
  name = "CSRFTokenMismatchError"
  statusCode = 401
  get _clearStack() {
    return true
  }
}

export class AuthorizationError extends Error {
  name = "AuthorizationError"
  statusCode = 403
  constructor(message = "You are not authorized to access this") {
    super(message)
  }
  get _clearStack() {
    return true
  }
}

export class NotFoundError extends Error {
  name = "NotFoundError"
  statusCode = 404
  constructor(message = "This could not be found") {
    super(message)
  }
  get _clearStack() {
    return true
  }
}

export class RedirectError extends Error {
  name = "RedirectError"
  statusCode = 302
  url: UrlObject | string
  constructor(url: UrlObject | string) {
    super(typeof url === "object" ? url.href! : url)
    this.url = url
  }
  get _clearStack() {
    return true
  }
}

export class PaginationArgumentError extends Error {
  name = "PaginationArgumentError"
  statusCode = 422
  constructor(message = "The pagination arguments are invalid") {
    super(message)
  }
}

if (process.env.JEST_WORKER_ID === undefined && !globalThis._BLITZ_ERROR_CLASS_REGISTERED) {
  SuperJson.registerClass(AuthenticationError, {
    identifier: "BlitzAuthenticationError",
    allowProps: errorProps,
  })

  SuperJson.registerClass(CSRFTokenMismatchError, {
    identifier: "BlitzCSRFTokenMismatchError",
    allowProps: errorProps,
  })

  SuperJson.registerClass(AuthorizationError, {
    identifier: "BlitzAuthorizationError",
    allowProps: errorProps,
  })

  SuperJson.registerClass(NotFoundError, {
    identifier: "BlitzNotFoundError",
    allowProps: errorProps,
  })

  SuperJson.registerClass(RedirectError, {
    identifier: "BlitzRedirectError",
    allowProps: errorProps,
  })

  SuperJson.registerClass(PaginationArgumentError, {
    identifier: "BlitzPaginationArgumentError",
    allowProps: errorProps,
  })

  globalThis._BLITZ_ERROR_CLASS_REGISTERED = true
}
