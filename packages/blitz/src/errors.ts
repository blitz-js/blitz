import _SuperJson from "superjson"
import type {UrlObject} from "url"

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
if (process.env.JEST_WORKER_ID === undefined) {
  SuperJson.registerClass(AuthenticationError, {
    identifier: "BlitzAuthenticationError",
    allowProps: errorProps,
  })
}

export class CSRFTokenMismatchError extends Error {
  name = "CSRFTokenMismatchError"
  statusCode = 401
  get _clearStack() {
    return true
  }
}
if (process.env.JEST_WORKER_ID === undefined) {
  SuperJson.registerClass(CSRFTokenMismatchError, {
    identifier: "BlitzCSRFTokenMismatchError",
    allowProps: errorProps,
  })
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
if (process.env.JEST_WORKER_ID === undefined) {
  SuperJson.registerClass(AuthorizationError, {
    identifier: "BlitzAuthorizationError",
    allowProps: errorProps,
  })
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
if (process.env.JEST_WORKER_ID === undefined) {
  SuperJson.registerClass(NotFoundError, {
    identifier: "BlitzNotFoundError",
    allowProps: errorProps,
  })
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
if (process.env.JEST_WORKER_ID === undefined) {
  SuperJson.registerClass(RedirectError, {
    identifier: "BlitzRedirectError",
    allowProps: errorProps,
  })
}

export class PaginationArgumentError extends Error {
  name = "PaginationArgumentError"
  statusCode = 422
  constructor(message = "The pagination arguments are invalid") {
    super(message)
  }
}
if (process.env.JEST_WORKER_ID === undefined) {
  SuperJson.registerClass(PaginationArgumentError, {
    identifier: "BlitzPaginationArgumentError",
    allowProps: errorProps,
  })
}
