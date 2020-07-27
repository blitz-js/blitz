export class CSRFTokenMismatchError extends Error {
  name = "CSRFTokenMismatchError"
  statusCode = 401
  message = "Unauthorized"
}

export class AuthenticationError extends Error {
  name = "AuthenticationError"
  statusCode = 401
  message = "Unauthorized"
}

export class AuthorizationError extends Error {
  name = "AuthorizationError"
  statusCode = 403
  message = "Forbidden"
}

export class NotFoundError extends Error {
  name = "NotFoundError"
  statusCode = 404
  message = "Not Found"
  // TODO - allow custom message
}
