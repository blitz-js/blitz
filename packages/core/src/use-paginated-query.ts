import {
  usePaginatedQuery as usePaginatedReactQuery,
  PaginatedQueryResult,
  QueryOptions,
} from "react-query"
import {emptyQueryFn, retryFunction} from "./use-query"
import {PromiseReturnType, InferUnaryParam, QueryFn} from "./types"
import {QueryCacheFunctions, getQueryCacheFunctions, getQueryKey} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"

type RestQueryResult<T extends QueryFn> = Omit<
  PaginatedQueryResult<PromiseReturnType<T>>,
  "resolvedData"
> &
  QueryCacheFunctions<PromiseReturnType<T>>

const isServer = typeof window === "undefined"

export function usePaginatedQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
  options?: QueryOptions<PromiseReturnType<T>>,
): [PromiseReturnType<T>, RestQueryResult<T>] {
  if (typeof queryFn === "undefined") {
    throw new Error("usePaginatedQuery is missing the first argument - it must be a query function")
  }

  if (typeof params === "undefined") {
    throw new Error(
      "usePaginatedQuery is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const queryRpcFn = isServer ? emptyQueryFn : ((queryFn as unknown) as EnhancedRpcFunction)

  const queryKey = getQueryKey(queryFn, params)

  const {resolvedData, ...queryRest} = usePaginatedReactQuery({
    queryKey,
    queryFn: (_apiUrl, params) => queryRpcFn(params, {fromQueryHook: true}),
    config: {
      suspense: true,
      retry: retryFunction,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<PromiseReturnType<T>>(queryKey),
  }

  return [resolvedData as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
