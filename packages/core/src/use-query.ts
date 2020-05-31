import {useQuery as useReactQuery, QueryResult, QueryOptions} from 'react-query'
import {PromiseReturnType, InferUnaryParam, QueryFn} from './types'
import {QueryCacheFunctions, queryCacheFunctions} from './utils/query-cache'

type RestQueryResult<T extends QueryFn> = Omit<QueryResult<PromiseReturnType<T>>, 'data'> &
  QueryCacheFunctions<PromiseReturnType<T>>

export function useQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
  options?: QueryOptions<QueryResult<PromiseReturnType<T>>>,
): [PromiseReturnType<T>, RestQueryResult<T>] {
  if (typeof queryFn === 'undefined') {
    throw new Error('useQuery is missing the first argument - it must be a query function')
  }

  if (typeof params === 'undefined') {
    throw new Error(
      "useQuery is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const {data, ...queryRest} = useReactQuery({
    queryKey: () => [
      (queryFn as any).cacheKey,
      typeof params === 'function' ? (params as Function)() : params,
    ],
    queryFn: (_: string, params) => queryFn(params),
    config: {
      suspense: true,
      retry: process.env.NODE_ENV === 'production' ? 3 : false,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...queryCacheFunctions((queryFn as any).cacheKey),
  }

  return [data as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
