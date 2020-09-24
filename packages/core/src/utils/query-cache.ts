import {queryCache, QueryKey} from "react-query"
import {serialize} from "superjson"
import {InferUnaryParam, QueryFn} from "../types"
import {EnhancedRpcFunction} from "rpc"

type MutateOptions = {
  refetch?: boolean
}

export interface QueryCacheFunctions<T> {
  mutate: (newData: T | ((oldData: T | undefined) => T), opts?: MutateOptions) => void
}

export const getQueryCacheFunctions = <T>(queryKey: QueryKey): QueryCacheFunctions<T> => ({
  mutate: (newData, opts = {refetch: true}) => {
    queryCache.setQueryData(queryKey, newData)
    if (opts.refetch) {
      return queryCache.invalidateQueries(queryKey, {refetchActive: true})
    }
    return null
  },
})

export function getQueryKey<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
) {
  if (typeof queryFn === "undefined") {
    throw new Error("getQueryKey is missing the first argument - it must be a query function")
  }
  if (typeof params === "undefined") {
    throw new Error(
      "getQueryKey is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const queryKey: [string, Record<string, any>] = [
    ((queryFn as unknown) as EnhancedRpcFunction)._meta.apiUrl,
    serialize(typeof params === "function" ? (params as Function)() : params),
  ]
  return queryKey
}

export function getInfiniteQueryKey<T extends QueryFn>(
  queryFn: T,
  params: InferUnaryParam<T> | (() => InferUnaryParam<T>),
) {
  if (typeof queryFn === "undefined") {
    throw new Error("getQueryKey is missing the first argument - it must be a query function")
  }
  if (typeof params === "undefined") {
    throw new Error(
      "getQueryKey is missing the second argument. This will be the input to your query function on the server. Pass `null` if the query function doesn't take any arguments",
    )
  }

  const queryKey: ["infinite", string, Record<string, any>] = [
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results. Without this cache for usePaginatedQuery and this will conflict and break.
    "infinite",
    ((queryFn as unknown) as EnhancedRpcFunction)._meta.apiUrl,
    serialize(typeof params === "function" ? (params as Function)() : params),
  ]
  return queryKey
}
