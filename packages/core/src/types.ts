export type {BlitzConfig} from "@blitzjs/config"

export type QueryFn = (...args: any) => Promise<any>

export type Dict<T> = Record<string, T | undefined>

export type ParsedUrlQuery = Dict<string | string[]>

export type ParsedUrlQueryValue = string | string[] | undefined

export type Options = {
  fromQueryHook?: boolean
}

// The actual resolver source definition
export type Resolver<TInput, TResult> = (input: TInput, ctx?: any) => Promise<TResult>

type RequestIdleCallbackHandle = any
type RequestIdleCallbackOptions = {
  timeout: number
}
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: () => number
}

declare global {
  namespace NodeJS {
    interface Global {
      _blitz_prismaClient: any
    }
  }
  interface Window {
    requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void
  }
}

export interface ErrorFallbackProps {
  error: Error & Record<any, any>
  resetErrorBoundary: (...args: Array<unknown>) => void
}
