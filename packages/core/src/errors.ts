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

export class PaginationArgumentError extends Error {
  name = "PaginationArgumentError"
  statusCode = 422
  constructor(message = "The pagination arguments are invalid") {
    super(message)
  }
}
