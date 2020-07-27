export class CSRFTokenMismatchError extends Error {
  name = "CSRFTokenMismatchError"
  statusCode = 401 // Unauthorized
}

export class AuthenticationError extends Error {
  name = "AuthenticationError"
  statusCode = 401 // Unauthorized
}

export class AuthorizationError extends Error {
  name = "AuthorizationError"
  statusCode = 403 // Forbidden
}

export class NotFoundError extends Error {
  name = "NotFoundError"
  statusCode = 404
}
