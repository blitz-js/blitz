import {
  InfiniteQueryOptions as RQInfiniteQueryConfig,
  InfiniteQueryResult,
  PaginatedQueryResult,
  QueryOptions,
  QueryResult,
  useInfiniteQuery as useInfiniteReactQuery,
  usePaginatedQuery as usePaginatedReactQuery,
  useQuery as useReactQuery,
} from "react-query"
import {useSession} from "./supertokens"
import {FirstParam, PromiseReturnType, QueryFn} from "./types"
import {useRouter} from "./use-router"
import {
  defaultQueryConfig,
  emptyQueryFn,
  getQueryCacheFunctions,
  getQueryKey,
  QueryCacheFunctions,
  sanitize,
} from "./utils/react-query-utils"

// -------------------------
// useQuery
// -------------------------
type RestQueryResult<TResult> = Omit<QueryResult<TResult>, "data"> & QueryCacheFunctions<TResult>

export function useQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options?: QueryOptions<TResult>,
): [TResult, RestQueryResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  // TODO - useSession here is a tempory fix for logout query invalidation until RQ v3
  useSession()
  const routerIsReady = useRouter().isReady
  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? (_apiUrl: string, params: any) =>
          enhancedResolverRpcClient(params, {fromQueryHook: true, alreadySerialized: true})
      : (emptyQueryFn as any),
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
  options?: QueryOptions<TResult>,
): [TResult, RestPaginatedResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("usePaginatedQuery is missing the first argument - it must be a query function")
  }

  // TODO - useSession here is a tempory fix for logout query invalidation until RQ v3
  useSession()
  const routerIsReady = useRouter().isReady
  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {resolvedData, ...queryRest} = usePaginatedReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? (_apiUrl: string, params: any) =>
          enhancedResolverRpcClient(params, {fromQueryHook: true, alreadySerialized: true})
      : (emptyQueryFn as any),
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
type RestInfiniteResult<TResult, TMoreVariable> = Omit<
  InfiniteQueryResult<TResult, TMoreVariable>,
  "resolvedData"
> &
  QueryCacheFunctions<TResult>

interface InfiniteQueryConfig<TResult, TFetchMoreResult>
  extends RQInfiniteQueryConfig<TResult, TFetchMoreResult> {
  getFetchMore: (lastPage: TResult, allPages: TResult[]) => TFetchMoreResult
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
): [TResult[], RestInfiniteResult<TResult, TFetchMoreResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  // TODO - useSession here is a tempory fix for logout query invalidation until RQ v3
  useSession()
  const routerIsReady = useRouter().isReady
  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useInfiniteReactQuery({
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results.
    // Without this cache for usePaginatedQuery and this will conflict and break.
    queryKey: routerIsReady ? [...queryKey, "infinite"] : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? (_apiUrl: string, _args: any, _infinite: string, resultOfGetFetchMore: TFetchMoreResult) =>
          enhancedResolverRpcClient(params(resultOfGetFetchMore), {fromQueryHook: true})
      : (emptyQueryFn as any),
    config: {
      ...defaultQueryConfig,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
  }

  return [data as TResult[], rest as RestInfiniteResult<TResult, TFetchMoreResult>]
}
