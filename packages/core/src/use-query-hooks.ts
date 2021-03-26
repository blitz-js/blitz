import {
  useInfiniteQuery as useInfiniteReactQuery,
  UseInfiniteQueryOptions as RQInfiniteQueryConfig,
  UseInfiniteQueryResult,
  // usePaginatedQuery as usePaginatedReactQuery,
  useQuery as useReactQuery,
  // PaginatedQueryResult,
  UseQueryOptions,
  UseQueryResult,
} from "react-query"
import {useSession} from "./auth/auth-client"
import {useRouter} from "./router"
import {FirstParam, PromiseReturnType, QueryFn} from "./types"
import {isClient} from "./utils"
import {
  emptyQueryFn,
  getQueryCacheFunctions,
  getQueryKey,
  QueryCacheFunctions,
  sanitize,
  useDefaultQueryConfig,
} from "./utils/react-query-utils"

type QueryLazyOptions = {suspense: unknown} | {enabled: unknown}
type QueryNonLazyOptions =
  | {suspense: true; enabled?: never}
  | {suspense?: never; enabled: true}
  | {suspense: true; enabled: true}
  | {suspense?: never; enabled?: never}

// -------------------------
// useQuery
// -------------------------
type RestQueryResult<TResult> = Omit<UseQueryResult<TResult>, "data"> & QueryCacheFunctions<TResult>

export function useQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options?: UseQueryOptions<TResult> & QueryNonLazyOptions,
): [TResult, RestQueryResult<TResult>]
export function useQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult> & QueryLazyOptions,
): [TResult | undefined, RestQueryResult<TResult>]
export function useQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult> = {},
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  const suspense =
    options?.enabled === false || options?.enabled === null ? false : options?.suspense
  const session = useSession({suspense})
  if (session.isLoading) {
    options.enabled = false
  }

  const routerIsReady = useRouter().isReady && isClient
  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? () => enhancedResolverRpcClient(params, {fromQueryHook: true, alreadySerialized: true})
      : (emptyQueryFn as any),
    ...useDefaultQueryConfig(),
    ...options,
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
  }

  // return [data, rest as RestQueryResult<TResult>]
  return [data, rest]
}

// -------------------------
// usePaginatedQuery
// -------------------------
type RestPaginatedResult<TResult> = Omit<UseQueryResult<TResult>, "data"> &
  QueryCacheFunctions<TResult>

export function usePaginatedQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options?: UseQueryOptions<TResult> & QueryNonLazyOptions,
): [TResult, RestPaginatedResult<TResult>]
export function usePaginatedQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult> & QueryLazyOptions,
): [TResult | undefined, RestPaginatedResult<TResult>]
export function usePaginatedQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult> = {},
) {
  if (typeof queryFn === "undefined") {
    throw new Error("usePaginatedQuery is missing the first argument - it must be a query function")
  }

  const suspense =
    options?.enabled === false || options?.enabled === null ? false : options?.suspense
  const session = useSession({suspense})
  if (session.isLoading) {
    options.enabled = false
  }

  const routerIsReady = useRouter().isReady
  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? () => enhancedResolverRpcClient(params, {fromQueryHook: true, alreadySerialized: true})
      : (emptyQueryFn as any),
    ...useDefaultQueryConfig(),
    ...options,
    keepPreviousData: true,
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
  }

  // return [data, rest as RestPaginatedResult<TResult>]
  return [data, rest]
}

// -------------------------
// useInfiniteQuery
// -------------------------
type RestInfiniteResult<TResult, TMoreVariable> = Omit<
  UseInfiniteQueryResult<TResult, TMoreVariable>,
  "data"
> &
  QueryCacheFunctions<TResult>

interface InfiniteQueryConfig<TResult, TFetchMoreResult>
  extends RQInfiniteQueryConfig<TResult, TFetchMoreResult> {
  // getNextPageParam: (lastPage: TResult, allPages: TResult[]) => TFetchMoreResult
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
): [TResult[], RestInfiniteResult<TResult, TFetchMoreResult> & QueryNonLazyOptions]
export function useInfiniteQuery<
  T extends QueryFn,
  TFetchMoreResult = any,
  TResult = PromiseReturnType<T>
>(
  queryFn: T,
  params: (fetchMoreResult: TFetchMoreResult) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TFetchMoreResult> & QueryLazyOptions,
): [TResult[] | undefined, RestInfiniteResult<TResult, TFetchMoreResult>]
export function useInfiniteQuery<
  T extends QueryFn,
  TFetchMoreResult = any,
  TResult = PromiseReturnType<T>
>(
  queryFn: T,
  params: (fetchMoreResult: TFetchMoreResult) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TFetchMoreResult>,
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  const suspense =
    options?.enabled === false || options?.enabled === null ? false : options?.suspense
  const session = useSession({suspense})
  if (session.isLoading) {
    options.enabled = false
  }

  const routerIsReady = useRouter().isReady
  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useInfiniteReactQuery({
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results.
    // Without this cache for usePaginatedQuery and this will conflict and break.
    queryKey: routerIsReady ? [...queryKey, "infinite"] : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? ({pageParam}) => enhancedResolverRpcClient(params(pageParam), {fromQueryHook: true})
      : (emptyQueryFn as any),
    ...useDefaultQueryConfig(),
    ...options,
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
    pageParams: data?.pageParams,
  }

  return [data?.pages, rest]
}
