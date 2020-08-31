import {
  usePaginatedQuery as usePaginatedReactQuery,
  PaginatedQueryResult,
  QueryOptions,
} from "react-query"
import {useSession} from "./supertokens"
import {useIsDevPrerender, emptyQueryFn, retryFunction} from "./use-query"
import {PromiseReturnType, InferUnaryParam, QueryFn} from "./types"
import {QueryCacheFunctions, getQueryCacheFunctions} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"
import {serialize} from "superjson"

type RestQueryResult<T extends QueryFn> = Omit<
  PaginatedQueryResult<PromiseReturnType<T>>,
  "resolvedData"
> &
  QueryCacheFunctions<PromiseReturnType<T>>

export function usePaginatedQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
  options?: QueryOptions<PaginatedQueryResult<PromiseReturnType<T>>>,
): [PromiseReturnType<T>, RestQueryResult<T>] {
  if (typeof queryFn === "undefined") {
    throw new Error("usePaginatedQuery is missing the first argument - it must be a query function")
  }

  if (typeof params === "undefined") {
    throw new Error(
      "usePaginatedQuery is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const queryRpcFn = useIsDevPrerender()
    ? emptyQueryFn
    : ((queryFn as unknown) as EnhancedRpcFunction)

  const {resolvedData, ...queryRest} = usePaginatedReactQuery({
    queryKey: [
      serialize(typeof params === "function" ? (params as Function)() : params),
      queryRpcFn._meta.apiUrl,
      // We add the session object here so queries will refetch if session changes
      useSession(),
    ],
    queryFn: (params) => queryRpcFn(params, {fromQueryHook: true}),
    config: {
      suspense: true,
      retry: retryFunction,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<PromiseReturnType<T>>(queryRpcFn._meta.apiUrl),
  }

  return [resolvedData as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
