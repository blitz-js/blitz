import {
  useInfiniteQuery as useInfiniteReactQuery,
  InfiniteQueryResult,
  InfiniteQueryOptions,
} from 'react-query'
import {PromiseReturnType, InferUnaryParam, QueryFn} from './types'
import {getQueryCacheFunctions, QueryCacheFunctions} from './utils/query-cache'
import {RpcFunction} from './rpc'

type RestQueryResult<T extends QueryFn> = Omit<
  InfiniteQueryResult<PromiseReturnType<T>, any>,
  'resolvedData'
> &
  QueryCacheFunctions<PromiseReturnType<T>[]>

export function useInfiniteQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
  options: InfiniteQueryOptions<PromiseReturnType<T>, any>,
): [PromiseReturnType<T>[], RestQueryResult<T>] {
  if (typeof queryFn === 'undefined') {
    throw new Error('useInfiniteQuery is missing the first argument - it must be a query function')
  }

  if (typeof params === 'undefined') {
    throw new Error(
      "useInfiniteQuery is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const queryRpcFn = queryFn as RpcFunction

  const {data, ...queryRest} = useInfiniteReactQuery({
    queryKey: () => [
      queryRpcFn.cacheKey as string,
      typeof params === 'function' ? (params as Function)() : params,
    ],
    queryFn: (_: string, params, more?) => queryRpcFn({...params, ...more}, {fromQueryHook: true}),
    config: {
      suspense: true,
      retry: process.env.NODE_ENV === 'production' ? 3 : false,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<PromiseReturnType<T>>(queryRpcFn.cacheKey as string),
  }

  return [data as PromiseReturnType<T>[], rest as RestQueryResult<T>]
}
