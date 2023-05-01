class ErrorWithStatusCode extends Error {
  statusCode

  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

export default async function getCustomStatusCodeFailure() {
  throw new ErrorWithStatusCode("Error with custom status code for test", 418)
}
