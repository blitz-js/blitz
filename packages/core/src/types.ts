export type QueryFn = (...args: any) => Promise<any>

export type Dict<T> = Record<string, T | undefined>

export type ParsedUrlQuery = Dict<string | string[]>

export type ParsedUrlQueryValue = string | string[] | undefined

export type Options = {
  fromQueryHook?: boolean
}

// The actual resolver source definition
export type Resolver<TInput, TResult> = (input: TInput, ctx?: any) => Promise<TResult>

// declare global {
//   namespace NodeJS {
//     interface Global {
//       _blitz_prismaClient: any
//     }
//   }
// }

export interface ErrorFallbackProps {
  error: Error & Record<any, any>
  resetErrorBoundary: (...args: Array<unknown>) => void
}
