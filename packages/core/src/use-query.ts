import {useQuery as useReactQuery, QueryResult, QueryOptions} from 'react-query'
import {PromiseReturnType, InferUnaryParam} from './types'
import {RpcFunction} from './rpc'

type QueryFn = (...args: any) => Promise<any>
type RestQueryResult<T extends QueryFn> = Omit<QueryResult<PromiseReturnType<T>>, 'data'>

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

  const queryRpcFn = queryFn as RpcFunction

  const {data, ...rest} = useReactQuery({
    queryKey: () => [
      queryRpcFn.cacheKey as string,
      typeof params === 'function' ? (params as Function)() : params,
    ],
    queryFn: (_: string, params) => queryRpcFn(params, {fromQueryHook: true}),
    config: {
      suspense: true,
      retry: process.env.NODE_ENV === 'production' ? 3 : false,
      ...options,
    },
  })
  return [data as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
