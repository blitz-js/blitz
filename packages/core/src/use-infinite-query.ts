import {
  useInfiniteQuery as useInfiniteReactQuery,
  InfiniteQueryResult,
  InfiniteQueryOptions,
} from "react-query"
import {useSession} from "./supertokens"
import {useIsDevPrerender, emptyQueryFn, retryFunction} from "./use-query"
import {PromiseReturnType, InferUnaryParam, QueryFn} from "./types"
import {getQueryCacheFunctions, QueryCacheFunctions} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"
import {serialize} from "superjson"

type RestQueryResult<T extends QueryFn> = Omit<
  InfiniteQueryResult<PromiseReturnType<T>, any>,
  "resolvedData"
> &
  QueryCacheFunctions<PromiseReturnType<T>[]>

export function useInfiniteQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
  options: InfiniteQueryOptions<PromiseReturnType<T>, any>,
): [PromiseReturnType<T>[], RestQueryResult<T>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  if (typeof params === "undefined") {
    throw new Error(
      "useInfiniteQuery is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const queryRpcFn = useIsDevPrerender()
    ? emptyQueryFn
    : ((queryFn as unknown) as EnhancedRpcFunction)

  const {data, ...queryRest} = useInfiniteReactQuery({
    queryKey: [
      queryRpcFn._meta.apiUrl,
      // We add the session object here so queries will refetch if session changes
      useSession(),
      serialize(typeof params === "function" ? (params as Function)() : params),
    ],
    queryFn: (_: string, __: any, params, pageParams?) =>
      queryRpcFn(params, {fromQueryHook: true, pageParams}),
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

  return [data as PromiseReturnType<T>[], rest as RestQueryResult<T>]
}
