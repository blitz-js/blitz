import Router from "next/router"
import {
  InfiniteQueryConfig as RQInfiniteQueryConfig,
  InfiniteQueryResult,
  PaginatedQueryConfig,
  PaginatedQueryResult,
  queryCache,
  QueryConfig,
  QueryResult,
  useInfiniteQuery as useInfiniteReactQuery,
  usePaginatedQuery as usePaginatedReactQuery,
  useQuery as useReactQuery,
} from "react-query"
import {FirstParam, PromiseReturnType, QueryFn} from "./types"
import {
  defaultQueryConfig,
  getQueryCacheFunctions,
  getQueryKey,
  QueryCacheFunctions,
  sanitize,
} from "./utils/react-query-utils"

Router.events.on("routeChangeComplete", async () => {
  await queryCache.invalidateQueries()
})

// -------------------------
// useQuery
// -------------------------
type RestQueryResult<TResult> = Omit<QueryResult<TResult>, "data"> & QueryCacheFunctions<TResult>

export function useQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options?: QueryConfig<TResult>,
): [TResult, RestQueryResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
    queryKey,
    queryFn: (_apiUrl: string, params: any) =>
      enhancedResolverRpcClient(params, {fromQueryHook: true, alreadySerialized: true}),
    config: {
      ...defaultQueryConfig,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
  }

  return [data as TResult, rest as RestQueryResult<TResult>]
}

// -------------------------
// usePaginatedQuery
// -------------------------
type RestPaginatedResult<TResult> = Omit<PaginatedQueryResult<TResult>, "resolvedData"> &
  QueryCacheFunctions<TResult>

export function usePaginatedQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options?: PaginatedQueryConfig<TResult>,
): [TResult, RestPaginatedResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("usePaginatedQuery is missing the first argument - it must be a query function")
  }

  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {resolvedData, ...queryRest} = usePaginatedReactQuery({
    queryKey,
    queryFn: (_apiUrl: string, params: any) =>
      enhancedResolverRpcClient(params, {fromQueryHook: true, alreadySerialized: true}),
    config: {
      ...defaultQueryConfig,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
  }

  return [resolvedData as TResult, rest as RestPaginatedResult<TResult>]
}

// -------------------------
// useInfiniteQuery
// -------------------------
type RestInfiniteResult<TResult> = Omit<InfiniteQueryResult<TResult>, "resolvedData"> &
  QueryCacheFunctions<TResult>

interface InfiniteQueryConfig<TResult, TFetchMoreResult> extends RQInfiniteQueryConfig<TResult> {
  getFetchMore?: (lastPage: TResult, allPages: TResult[]) => TFetchMoreResult
}

// TODO - Fix TFetchMoreResult not actually taking affect in apps.
// It shows as 'unknown' in the params() input argumunt, but should show as TFetchMoreResult
export function useInfiniteQuery<
  T extends QueryFn,
  TFetchMoreResult = any,
  TResult = PromiseReturnType<T>
>(
  queryFn: T,
  params: (fetchMoreResult: TFetchMoreResult) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TFetchMoreResult>,
): [TResult[], RestInfiniteResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params(undefined!))

  const {data, ...queryRest} = useInfiniteReactQuery({
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results.
    // Without this cache for usePaginatedQuery and this will conflict and break.
    queryKey: [...queryKey, "infinite"],
    queryFn: (_apiUrl: string, _infinite: string, resultOfGetFetchMore: TFetchMoreResult) =>
      enhancedResolverRpcClient(params(resultOfGetFetchMore), {fromQueryHook: true}),
    config: {
      ...defaultQueryConfig,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
  }

  return [data as TResult[], rest as RestInfiniteResult<TResult>]
}
