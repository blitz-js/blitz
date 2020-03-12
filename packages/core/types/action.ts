import {UserContext} from './identity'

export type ActionInput = {
  user: UserContext
  query: Record<string, any>
  attrs?: Record<string, any>
}

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
    type: string
    payload?: {}
  }
}

export type ActionResult<T> = ActionSuccess<T> | ActionError
