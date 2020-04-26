import {
  useQuery as useReactQuery,
  usePaginatedQuery as usePaginatedReactQuery,
  PaginatedQueryResult,
  QueryResult,
  QueryOptions,
} from 'react-query'

/**
 * Get the type of the value, that the Promise holds.
 */
export declare type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T

/**
 * Get the return type of a function which returns a Promise.
 */
export declare type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

type QueryFn = (...args: any) => Promise<any>

interface Options<T> extends QueryOptions<T> {
  paginated?: boolean
}

type RestReactQueryResult<O extends Options<any>> = O['paginated'] extends true
  ? Omit<PaginatedQueryResult<O>, 'resolvedData'>
  : Omit<QueryResult<O>, 'data'>

// interface QueryFn {
//   (...args: any): Promise<any>
//   cacheKey: string
// }

export function useQuery<T extends QueryFn, O extends Options<T>>(
  queryFn: T,
  params?: any,
  options?: O,
): [PromiseReturnType<T>, RestReactQueryResult<O>] {
  const config = {
    suspense: true,
    retry: process.env.NODE_ENV === 'production' ? 3 : false,
    ...options,
  }

  if (options?.paginated) {
    const {resolvedData, ...rest} = usePaginatedReactQuery(
      [(queryFn as any).cacheKey, params],
      (_, params) => queryFn(params),
      config,
    )
    return [resolvedData as PromiseReturnType<T>, rest as any]
  }

  const {data, ...rest} = useReactQuery(
    [(queryFn as any).cacheKey, params],
    (_, params) => queryFn(params),
    config,
  )

  return [data as PromiseReturnType<T>, rest as any]
}
