import {
  useInfiniteQuery as useInfiniteReactQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useQuery as useReactQuery,
  UseQueryOptions,
  UseQueryResult,
} from "react-query"
import {useSession} from "./auth/auth-client"
import {getBlitzRuntimeData} from "./blitz-data"
import {useRouter} from "./router"
import {FirstParam, PromiseReturnType, QueryFn} from "./types"
import {isServer} from "./utils"
import {
  emptyQueryFn,
  getQueryCacheFunctions,
  getQueryKey,
  QueryCacheFunctions,
  sanitizeQuery,
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
type RestQueryResult<TResult, TError> = Omit<UseQueryResult<TResult, TError>, "data"> &
  QueryCacheFunctions<TResult>

export function useQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  params: FirstParam<T>,
  options?: UseQueryOptions<TResult, TError, TSelectedData> & QueryNonLazyOptions,
): [TSelectedData, RestQueryResult<TSelectedData, TError>]
export function useQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult, TError, TSelectedData> & QueryLazyOptions,
): [TSelectedData | undefined, RestQueryResult<TSelectedData, TError>]
export function useQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult, TError, TSelectedData> = {},
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  const suspenseEnabled = process.env.__BLITZ_SUSPENSE_ENABLED
  let enabled = isServer && suspenseEnabled ? false : options?.enabled ?? options?.enabled !== null
  const suspense = enabled === false ? false : options?.suspense
  const session = useSession({suspense})
  if (session.isLoading) {
    enabled = false
  }

  const routerIsReady = useRouter().isReady || (isServer && suspenseEnabled)
  const enhancedResolverRpcClient = sanitizeQuery(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? () => enhancedResolverRpcClient(params, {fromQueryHook: true})
      : (emptyQueryFn as any),
    ...options,
    enabled,
  })

  if (
    queryRest.isIdle &&
    isServer &&
    suspenseEnabled !== false &&
    !data &&
    (!options || !("suspense" in options) || options.suspense) &&
    (!options || !("enabled" in options) || options.enabled)
  ) {
    throw new Promise(() => {})
  }

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
type RestPaginatedResult<TResult, TError> = Omit<UseQueryResult<TResult, TError>, "data"> &
  QueryCacheFunctions<TResult>

export function usePaginatedQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  params: FirstParam<T>,
  options?: UseQueryOptions<TResult, TError, TSelectedData> & QueryNonLazyOptions,
): [TSelectedData, RestPaginatedResult<TSelectedData, TError>]
export function usePaginatedQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult, TError, TSelectedData> & QueryLazyOptions,
): [TSelectedData | undefined, RestPaginatedResult<TSelectedData, TError>]
export function usePaginatedQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult, TError, TSelectedData> = {},
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
  const enhancedResolverRpcClient = sanitizeQuery(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? () => enhancedResolverRpcClient(params, {fromQueryHook: true})
      : (emptyQueryFn as any),
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
interface RestInfiniteResult<TResult, TError>
  extends Omit<UseInfiniteQueryResult<TResult, TError>, "data">,
    QueryCacheFunctions<TResult> {
  pageParams: any
}

interface InfiniteQueryConfig<TResult, TError, TSelectedData>
  extends UseInfiniteQueryOptions<TResult, TError, TSelectedData, TResult> {
  // getPreviousPageParam?: (lastPage: TResult, allPages: TResult[]) => TGetPageParamResult
  // getNextPageParam?: (lastPage: TResult, allPages: TResult[]) => TGetPageParamResult
}

export function useInfiniteQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TError, TSelectedData> & QueryNonLazyOptions,
): [TSelectedData[], RestInfiniteResult<TSelectedData, TError>]
export function useInfiniteQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TError, TSelectedData> & QueryLazyOptions,
): [TSelectedData[] | undefined, RestInfiniteResult<TSelectedData, TError>]
export function useInfiniteQuery<
  T extends QueryFn,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TError, TSelectedData>,
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
  const enhancedResolverRpcClient = sanitizeQuery(queryFn)
  const queryKey = getQueryKey(queryFn, getQueryParams)

  const {data, ...queryRest} = useInfiniteReactQuery({
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results.
    // Without this cache for usePaginatedQuery and this will conflict and break.
    queryKey: routerIsReady ? [...queryKey, "infinite"] : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? ({pageParam}) => enhancedResolverRpcClient(getQueryParams(pageParam), {fromQueryHook: true})
      : (emptyQueryFn as any),
    ...options,
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, getQueryParams),
    pageParams: data?.pageParams,
  }

  return [data?.pages as any, rest]
}
