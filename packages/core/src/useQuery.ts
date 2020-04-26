import {useQuery as useReactQuery} from 'react-query'

/**
 * Get the type of the value, that the Promise holds.
 */
export declare type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T

/**
 * Get the return type of a function which returns a Promise.
 */
export declare type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

type QueryFn = (...args: any) => Promise<any>

// interface QueryFn {
//   (...args: any): Promise<any>
//   cacheKey: string
// }

/**
 * Infer the type of the parameter from function that takes a single argument
 */
type InferUnaryParam<F extends Function> = F extends (args: infer A) => any ? A : never

export function useQuery<T extends QueryFn>(
  queryFn: T,
  params?: InferUnaryParam<T>,
  options: any = {},
): [PromiseReturnType<T>, Record<any, any>] {
  const {data, ...rest} = useReactQuery([(queryFn as any).cacheKey, params], (_, params) => queryFn(params), {
    suspense: true,
    retry: process.env.NODE_ENV === 'production' ? 3 : false,
    ...options,
  })

  return [data as PromiseReturnType<T>, rest]
}
