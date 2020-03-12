export type ActionSuccess<T> = {
  success: {
    payload: T
    [propType: string]: any
  }
  error?: undefined
}

export type ActionError = {
  success?: undefined
  error: {
    messages: any[]
  }
}

export type ActionResult<T> = ActionSuccess<T> | ActionError
