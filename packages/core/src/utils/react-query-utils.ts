import {queryCache, QueryKey} from "react-query"
import {serialize} from "superjson"
import {Resolver, EnhancedResolverRpcClient, QueryFn} from "../types"
import {isServer, isClient} from "."

type MutateOptions = {
  refetch?: boolean
}

export interface QueryCacheFunctions<T> {
  mutate: (
    newData: T | ((oldData: T | undefined) => T),
    opts?: MutateOptions,
  ) => Promise<void | ReturnType<typeof queryCache.invalidateQueries>>
}

export const getQueryCacheFunctions = <T>(queryKey: QueryKey): QueryCacheFunctions<T> => ({
  mutate: (newData, opts = {refetch: true}) => {
    return new Promise((res) => {
      queryCache.setQueryData(queryKey, newData)
      let result: void | ReturnType<typeof queryCache.invalidateQueries>
      if (opts.refetch) {
        result = res(queryCache.invalidateQueries(queryKey, {refetchActive: true}))
      }
      if (isClient) {
        // Fix for https://github.com/blitz-js/blitz/issues/1174
        window.requestIdleCallback(() => {
          res(result)
        })
      } else {
        res(result)
      }
    })
  },
})

export const emptyQueryFn: EnhancedResolverRpcClient<unknown, unknown> = (() => {
  const fn = () => new Promise(() => {})
  fn._meta = {
    name: "emptyQueryFn",
    type: "n/a" as any,
    filePath: "n/a",
    apiUrl: "",
  }
  return fn
})()

export const sanitize = <TInput, TResult>(
  queryFn: Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
) => {
  if (isServer) {
    // Prevents logging garbage during static pre-rendering
    return emptyQueryFn
  }

  return queryFn as EnhancedResolverRpcClient<TInput, TResult>
}

export const getQueryKeyFromUrlAndParams = (url: string, params: unknown) => {
  const queryKey = [url]

  const args = typeof params === "function" ? (params as Function)() : params
  queryKey.push(serialize(args) as any)

  return queryKey as [string, any]
}

export function getQueryKey<TInput, TResult, T extends QueryFn>(
  resolver: T | Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
  params?: TInput,
) {
  if (typeof resolver === "undefined") {
    throw new Error("getQueryKey is missing the first argument - it must be a resolver function")
  }

  return getQueryKeyFromUrlAndParams(sanitize(resolver)._meta.apiUrl, params)
}

export function getInfiniteQueryKey<TInput, TResult>(
  queryFn: Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
) {
  if (typeof queryFn === "undefined") {
    throw new Error(
      "getInfiniteQueryKey is missing the first argument - it must be a query function",
    )
  }

  const queryKey: ["infinite", string] = [
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results. Without this cache for usePaginatedQuery and this will conflict and break.
    "infinite",
    sanitize(queryFn)._meta.apiUrl,
  ]
  return queryKey
}

export const retryFunction = (failureCount: number, error: any) => {
  if (process.env.NODE_ENV !== "production") return false

  // Retry (max. 3 times) only if network error detected
  if (error.message === "Network request failed" && failureCount <= 3) return true

  return false
}

export const defaultQueryConfig = {
  suspense: true,
  retry: retryFunction,
}
