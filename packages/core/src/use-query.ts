import {useQuery as useReactQuery, QueryResult, QueryOptions} from "react-query"
import {useSession} from "./supertokens"
import {PromiseReturnType, InferUnaryParam, QueryFn} from "./types"
import {QueryCacheFunctions, getQueryCacheFunctions} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"
import {serialize} from "superjson"

type RestQueryResult<T extends QueryFn> = Omit<QueryResult<PromiseReturnType<T>>, "data"> &
  QueryCacheFunctions<PromiseReturnType<T>>

export const emptyQueryFn: EnhancedRpcFunction = (() => {
  const fn = () => new Promise(() => {})
  fn._meta = {
    name: "emptyQueryFn",
    type: "n/a",
    path: "n/a",
    apiUrl: "",
  }
  return fn
})()

const isServer = typeof window === "undefined"

// NOTE - this is only for use inside useQuery
export const useIsDevPrerender = () => {
  if (process.env.NODE_ENV === "production") {
    return false
  } else {
    // useQuery is only for client-side data fetching, so if it's running on the
    // server, it's for pre-render
    return isServer
  }
}

export const retryFunction = (failureCount: number, error: any) => {
  if (process.env.NODE_ENV !== "production") return false

  // Retry (max. 3 times) only if network error detected
  if (error.message === "Network request failed" && failureCount <= 3) return true

  return false
}

export function useQuery<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
  options?: QueryOptions<QueryResult<PromiseReturnType<T>>>,
): [PromiseReturnType<T>, RestQueryResult<T>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  if (typeof params === "undefined") {
    throw new Error(
      "useQuery is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const queryRpcFn = useIsDevPrerender()
    ? emptyQueryFn
    : ((queryFn as unknown) as EnhancedRpcFunction)

  const {data, ...queryRest} = useReactQuery({
    queryKey: [
      queryRpcFn._meta.apiUrl,
      // We add the session object here so queries will refetch if session changes
      useSession(),
      serialize(typeof params === "function" ? (params as Function)() : params),
    ],
    queryFn: (_: string, __: any, params) => queryRpcFn(params, {fromQueryHook: true}),
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

  return [data as PromiseReturnType<T>, rest as RestQueryResult<T>]
}
