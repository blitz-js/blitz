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
  const queryOptions = {
    suspense: true,
    retry: process.env.NODE_ENV === 'production' ? 3 : false,
    ...options,
  }

  const {resolvedData: paginatedData, ...paginatedRest} = usePaginatedReactQuery(
    [(queryFn as any).cacheKey + 'Paginated', !!options?.paginated, params],
    (_: string, paginated: boolean, params: any) => (!paginated ? Promise.resolve(null) : queryFn(params)),
    queryOptions,
  )
  const {data, ...rest} = useReactQuery(
    [(queryFn as any).cacheKey, !!options?.paginated, params],
    (_: string, paginated: boolean, params: any) => (paginated ? Promise.resolve(null) : queryFn(params)),
    queryOptions,
  )

  return options?.paginated
    ? [paginatedData as PromiseReturnType<T>, paginatedRest as RestReturnType<T, O>]
    : [data as PromiseReturnType<T>, rest as RestReturnType<T, O>]
}
