import {useQuery as useReactQuery, QueryResult, QueryConfig} from "react-query"
import {Resolver} from "./types"
import {QueryCacheFunctions, getQueryCacheFunctions, getQueryKey} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"

type RestQueryResult<TResult> = Omit<QueryResult<TResult>, "data"> & QueryCacheFunctions<TResult>

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

export const retryFunction = (failureCount: number, error: any) => {
  if (process.env.NODE_ENV !== "production") return false

  // Retry (max. 3 times) only if network error detected
  if (error.message === "Network request failed" && failureCount <= 3) return true

  return false
}

export function useQuery<TInput, TResult>(
  queryFn: Resolver<TInput, TResult>,
  params: TInput,
  options?: QueryConfig<TResult>,
): [TResult, RestQueryResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  const queryRpcFn = isServer ? emptyQueryFn : ((queryFn as unknown) as EnhancedRpcFunction)

  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
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

  return [data as TResult, rest as RestQueryResult<TResult>]
}
