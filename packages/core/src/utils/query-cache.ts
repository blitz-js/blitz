import {queryCache, QueryKey} from "react-query"
import {serialize} from "superjson"
import {Resolver} from "../types"
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

export function getQueryKey<TInput, TResult>(queryFn: Resolver<TInput, TResult>, params: TInput) {
  if (typeof queryFn === "undefined") {
    throw new Error("getQueryKey is missing the first argument - it must be a query function")
  }

  const queryKey: [string, Record<string, any>] = [
    ((queryFn as unknown) as EnhancedRpcFunction)._meta.apiUrl,
    serialize(typeof params === "function" ? (params as Function)() : params),
  ]
  return queryKey
}

export function getInfiniteQueryKey<TInput, TResult>(queryFn: Resolver<TInput, TResult>) {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "getInfiniteQueryKey is missing the first argument - it must be a query function",
    )
  }

  const queryKey: ["infinite", string] = [
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results. Without this cache for usePaginatedQuery and this will conflict and break.
    "infinite",
    ((queryFn as unknown) as EnhancedRpcFunction)._meta.apiUrl,
  ]
  return queryKey
}
