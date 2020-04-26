import {
  useQuery as useReactQuery,
  usePaginatedQuery as usePaginatedReactQuery,
  PaginatedQueryResult,
  QueryResult,
  QueryOptions,
} from 'react-query'

type QueryFn = (...args: any) => Promise<any>

interface Options<T> extends QueryOptions<T> {
  paginated?: boolean
}

/**
 * Get the type of the value, that the Promise holds.
 */
export declare type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T

/**
 * Get the return type of a function which returns a Promise.
 */
export declare type PromiseReturnType<T extends QueryFn> = PromiseType<ReturnType<T>>

/**
 * Get useQuery result without "data"
 */
type RestQueryResult<T extends QueryFn> = Omit<QueryResult<PromiseReturnType<T>>, 'data'>

/**
 * Get usePaginatedQuery result without "resolvedData"
 */
type RestPaginatedQueryResult<T extends QueryFn> = Omit<
  PaginatedQueryResult<PromiseReturnType<T>>,
  'resolvedData'
>

/**
 * Get "rest" object return value based on paginated option
 */
type RestReturnType<T extends QueryFn, O extends Options<T>> = O['paginated'] extends true
  ? RestPaginatedQueryResult<T>
  : RestQueryResult<T>

export function useQuery<T extends QueryFn, O extends Options<T>>(
  queryFn: T,
  params?: any,
  options?: O,
): [PromiseReturnType<T>, RestReturnType<T, O>] {
  const queryKey: [string, {}] = [(queryFn as any).cacheKey, params]
  const queryFunction = (_: string, params: {}) => queryFn(params)
  const queryOptions = {
    suspense: true,
    retry: process.env.NODE_ENV === 'production' ? 3 : false,
    ...options,
  }

  if (options?.paginated) {
    const {resolvedData, ...rest} = usePaginatedReactQuery(queryKey, queryFunction, queryOptions)
    return [resolvedData as PromiseReturnType<T>, rest as RestReturnType<T, O>]
  }

  const {data, ...rest} = useReactQuery(queryKey, queryFunction, queryOptions)
  return [data as PromiseReturnType<T>, rest as RestReturnType<T, O>]
}
