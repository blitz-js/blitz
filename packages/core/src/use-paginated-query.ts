import {
  usePaginatedQuery as usePaginatedReactQuery,
  PaginatedQueryResult,
  PaginatedQueryConfig,
} from "react-query"
import {emptyQueryFn, retryFunction} from "./use-query"
import {Resolver} from "./types"
import {QueryCacheFunctions, getQueryCacheFunctions, getQueryKey} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"

type RestQueryResult<TResult> = Omit<PaginatedQueryResult<TResult>, "resolvedData"> &
  QueryCacheFunctions<TResult>

const isServer = typeof window === "undefined"

export function usePaginatedQuery<TInput, TResult>(
  queryFn: Resolver<TInput, TResult>,
  params: TInput,
  options?: PaginatedQueryConfig<TResult>,
): [TResult, RestQueryResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("usePaginatedQuery is missing the first argument - it must be a query function")
  }

  const queryRpcFn = isServer ? emptyQueryFn : ((queryFn as unknown) as EnhancedRpcFunction)

  const queryKey = getQueryKey(queryFn, params)

  const {resolvedData, ...queryRest} = usePaginatedReactQuery({
    queryKey,
    queryFn: (_apiUrl: string, params: any) =>
      queryRpcFn(params, {fromQueryHook: true, alreadySerialized: true}),
    config: {
      suspense: true,
      retry: retryFunction,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<TResult>(queryKey),
  }

  return [resolvedData as TResult, rest as RestQueryResult<TResult>]
}
