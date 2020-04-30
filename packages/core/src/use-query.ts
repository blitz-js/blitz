import {
  useQuery as useReactQuery,
  usePaginatedQuery as usePaginatedReactQuery,
  PaginatedQueryResult,
  QueryResult,
  QueryOptions,
} from 'react-query'
import {PromiseReturnType, InferUnaryParam} from './types'

type QueryFn = (...args: any) => Promise<any>

interface Options<T> extends QueryOptions<T> {
  paginated?: boolean
}

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
  params?: InferUnaryParam<T>,
  options?: O,
): [PromiseReturnType<T>, RestReturnType<T, O>] {
  const queryKey: [string, any] = [(queryFn as any).cacheKey, params]
  const queryFunction = (_: string, params: {}) => queryFn(params)
  const queryOptions = {
    suspense: true,
    retry: process.env.NODE_ENV === 'production' ? 3 : false,
    ...options,
  }

  if (options?.paginated) {
    // TODO: this could be an issue, unless we assume the `paginated` option will always be constant when it's called
    // alternatively consider separating this in `useQuery` and `usePaginatedQuery`
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {resolvedData, ...rest} = usePaginatedReactQuery(queryKey, queryFunction, queryOptions)
    return [resolvedData as PromiseReturnType<T>, rest as RestReturnType<T, O>]
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {data, ...rest} = useReactQuery(queryKey, queryFunction, queryOptions)
  return [data as PromiseReturnType<T>, rest as RestReturnType<T, O>]
}
