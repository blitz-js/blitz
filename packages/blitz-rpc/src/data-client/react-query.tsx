import {
  useInfiniteQuery as useInfiniteReactQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useQuery as useReactQuery,
  UseQueryOptions,
  UseQueryResult,
  MutateOptions,
  useMutation as useReactQueryMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query"
import {useSession} from "@blitzjs/auth"
import {isServer, FirstParam, PromiseReturnType, AsyncFunc} from "blitz"
import {
  emptyQueryFn,
  getQueryCacheFunctions,
  getQueryKey,
  QueryCacheFunctions,
  sanitizeQuery,
  sanitizeMutation,
  getInfiniteQueryKey,
} from "./react-query-utils"
import {useRouter} from "next/router"

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
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options?: UseQueryOptions<TResult, TError, TSelectedData> & QueryNonLazyOptions,
): [TSelectedData, RestQueryResult<TSelectedData, TError>]
export function useQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult, TError, TSelectedData> & QueryLazyOptions,
): [TSelectedData | undefined, RestQueryResult<TSelectedData, TError>]
export function useQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult, TError, TSelectedData> = {},
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  const suspenseEnabled = Boolean(globalThis.__BLITZ_SUSPENSE_ENABLED)
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
      ? ({signal}) => enhancedResolverRpcClient(params, {fromQueryHook: true}, signal)
      : (emptyQueryFn as any),
    ...options,
    enabled,
  })

  if (
    queryRest.fetchStatus === "idle" &&
    isServer &&
    suspenseEnabled !== false &&
    !data &&
    (!options || !("suspense" in options) || options.suspense) &&
    (!options || !("enabled" in options) || options.enabled)
  ) {
    const e = new Error()
    e.name = "Rendering Suspense fallback..."
    delete e.stack
    throw e
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
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options?: UseQueryOptions<TResult, TError, TSelectedData> & QueryNonLazyOptions,
): [TSelectedData, RestPaginatedResult<TSelectedData, TError>]
export function usePaginatedQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult, TError, TSelectedData> & QueryLazyOptions,
): [TSelectedData | undefined, RestPaginatedResult<TSelectedData, TError>]
export function usePaginatedQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: UseQueryOptions<TResult, TError, TSelectedData> = {},
) {
  if (typeof queryFn === "undefined") {
    throw new Error("usePaginatedQuery is missing the first argument - it must be a query function")
  }

  const suspenseEnabled = Boolean(globalThis.__BLITZ_SUSPENSE_ENABLED)
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
      ? ({signal}) => enhancedResolverRpcClient(params, {fromQueryHook: true}, signal)
      : (emptyQueryFn as any),
    ...options,
    keepPreviousData: true,
    enabled,
  })

  if (
    queryRest.fetchStatus === "idle" &&
    isServer &&
    suspenseEnabled !== false &&
    !data &&
    (!options || !("suspense" in options) || options.suspense) &&
    (!options || !("enabled" in options) || options.enabled)
  ) {
    const e = new Error()
    e.name = "Rendering Suspense fallback..."
    delete e.stack
    throw e
  }

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
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TError, TSelectedData> & QueryNonLazyOptions,
): [TSelectedData[], RestInfiniteResult<TSelectedData, TError>]
export function useInfiniteQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TError, TSelectedData> & QueryLazyOptions,
): [TSelectedData[] | undefined, RestInfiniteResult<TSelectedData, TError>]
export function useInfiniteQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = unknown,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: InfiniteQueryConfig<TResult, TError, TSelectedData>,
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  const suspenseEnabled = Boolean(globalThis.__BLITZ_SUSPENSE_ENABLED)
  let enabled = isServer && suspenseEnabled ? false : options?.enabled ?? options?.enabled !== null
  const suspense = enabled === false ? false : options?.suspense
  const session = useSession({suspense})
  if (session.isLoading) {
    enabled = false
  }

  const routerIsReady = useRouter().isReady || (isServer && suspenseEnabled)
  const enhancedResolverRpcClient = sanitizeQuery(queryFn)
  const queryKey = getInfiniteQueryKey(queryFn, getQueryParams)

  const {data, ...queryRest} = useInfiniteReactQuery({
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results.
    // Without this cache for usePaginatedQuery and this will conflict and break.
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? ({pageParam, signal}) =>
          enhancedResolverRpcClient(getQueryParams(pageParam), {fromQueryHook: true}, signal)
      : (emptyQueryFn as any),
    ...options,
    enabled,
  })

  if (
    queryRest.fetchStatus === "idle" &&
    isServer &&
    suspenseEnabled !== false &&
    !data &&
    (!options || !("suspense" in options) || options.suspense) &&
    (!options || !("enabled" in options) || options.enabled)
  ) {
    const e = new Error()
    e.name = "Rendering Suspense fallback..."
    delete e.stack
    throw e
  }

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, getQueryParams),
    pageParams: data?.pageParams,
  }

  return [data?.pages as any, rest]
}

// -------------------------------------------------------------------
//                       useMutation
// -------------------------------------------------------------------

/*
 * We have to override react-query's MutationFunction and MutationResultPair
 * types so because we have throwOnError:true by default. And by the RQ types
 * have the mutate function result typed as TData|undefined which isn't typed
 * properly with throwOnError.
 *
 * So this fixes that.
 */
export declare type MutateFunction<
  TData,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown,
> = (
  variables?: TVariables,
  config?: MutateOptions<TData, TError, TVariables, TContext>,
) => Promise<TData>

export declare type MutationResultPair<TData, TError, TVariables, TContext> = [
  MutateFunction<TData, TError, TVariables, TContext>,
  Omit<UseMutationResult<TData, TError>, "mutate" | "mutateAsync">,
]

export declare type MutationFunction<TData, TVariables = unknown> = (
  variables: TVariables,
  ctx?: any,
) => Promise<TData>

export function useMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  mutationResolver: MutationFunction<TData, TVariables>,
  config?: UseMutationOptions<TData, TError, TVariables, TContext>,
): MutationResultPair<TData, TError, TVariables, TContext> {
  const enhancedResolverRpcClient = sanitizeMutation(mutationResolver)

  const {mutate, mutateAsync, ...rest} = useReactQueryMutation<TData, TError, TVariables, TContext>(
    (variables) => enhancedResolverRpcClient(variables, {fromQueryHook: true}),
    {
      throwOnError: true,
      ...config,
    } as any,
  )

  return [mutateAsync, rest] as MutationResultPair<TData, TError, TVariables, TContext>
}
