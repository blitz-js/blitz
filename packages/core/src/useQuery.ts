import {
  useQuery as useReactQuery,
  usePaginatedQuery as usePaginatedReactQuery,
  PaginatedQueryResult,
  QueryResult,
  QueryOptions,
  AnyQueryKey,
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

type RestReactQueryResult<T extends QueryFn, O extends Options<any>> = O['paginated'] extends true
  ? Omit<PaginatedQueryResult<T>, 'resolvedData'>
  : Omit<QueryResult<T>, 'data'>

export function useQuery<T extends QueryFn, O extends Options<T>>(
  queryFn: T,
  params?: any,
  options?: O,
): [PromiseReturnType<T>, RestReactQueryResult<T, O>] {
  const queryKey: [string, any] = [(queryFn as any).cacheKey, params]
  const queryFunction = (_: any, params: any) => queryFn(params)
  const queryOptions = {
    suspense: true,
    retry: process.env.NODE_ENV === 'production' ? 3 : false,
    ...options,
  }

  if (options?.paginated) {
    const {resolvedData, ...rest} = usePaginatedReactQuery(queryKey, queryFunction, queryOptions)
    return [resolvedData as PromiseReturnType<T>, rest as RestReactQueryResult<T, O>]
  }

  const {data, ...rest} = useReactQuery(queryKey, queryFunction, queryOptions)

  return [data as PromiseReturnType<T>, rest as RestReactQueryResult<T, O>]
}
