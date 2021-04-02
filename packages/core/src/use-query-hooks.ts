import {
  useInfiniteQuery as useInfiniteReactQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useQuery as useReactQuery,
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
      ? () => enhancedResolverRpcClient(params, {fromQueryHook: true})
      : (emptyQueryFn as any),
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
// useInfiniteQuery
// -------------------------
interface RestInfiniteResult<TResult>
  extends Omit<UseInfiniteQueryResult<TResult>, "data">,
    QueryCacheFunctions<TResult> {
  pageParams: any
}

interface InfiniteQueryConfig<TResult> extends UseInfiniteQueryOptions<TResult> {
  // getPreviousPageParam?: (lastPage: TResult, allPages: TResult[]) => TGetPageParamResult
  // getNextPageParam?: (lastPage: TResult, allPages: TResult[]) => TGetPageParamResult
}

export function useInfiniteQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult>,
): [TResult[], RestInfiniteResult<TResult> & QueryNonLazyOptions]
export function useInfiniteQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult> & QueryLazyOptions,
): [TResult[] | undefined, RestInfiniteResult<TResult>]
export function useInfiniteQuery<T extends QueryFn, TResult = PromiseReturnType<T>>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult>,
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
  const queryKey = getQueryKey(queryFn, getQueryParams)

  const {data, ...queryRest} = useInfiniteReactQuery({
    // We need an extra cache key for infinite loading so that the cache for
    // this query is stored separately, since the hook result is an array of results.
    // Without this, the cache for useQuery with `keepPreviousData: true` will conflict
    // and break with this.
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
