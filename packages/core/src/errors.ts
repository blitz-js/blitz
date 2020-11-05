import sj from "superjson"

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
  sj.registerClass(AuthenticationError, "BlitzAuthenticationError")
}

export class CSRFTokenMismatchError extends Error {
  name = "CSRFTokenMismatchError"
  statusCode = 401
  get _clearStack() {
    return true
  }
}
if (process.env.JEST_WORKER_ID === undefined) {
  sj.registerClass(CSRFTokenMismatchError, "BlitzCSRFTokenMismatchError")
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
  sj.registerClass(AuthorizationError, "BlitzAuthorizationError")
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
  sj.registerClass(NotFoundError, "BlitzNotFoundError")
}
