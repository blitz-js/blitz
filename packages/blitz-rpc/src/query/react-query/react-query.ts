import {
  useQueryErrorResetBoundary,
  QueryClientProvider,
  HydrationBoundary,
  keepPreviousData,
} from "@tanstack/react-query"
import type {DefaultError, InfiniteData} from "@tanstack/query-core"

import {useInfiniteQuery as useInfiniteReactQuery} from "@tanstack/react-query"
import {useSuspenseInfiniteQuery as useSuspenseInfiniteReactQuery} from "@tanstack/react-query"
import {useQuery as useReactQuery} from "@tanstack/react-query"
import {useSuspenseQuery as useSuspenseReactQuery} from "@tanstack/react-query"
import {useMutation as useReactQueryMutation} from "@tanstack/react-query"

export const reactQueryClientReExports = {
  useQueryErrorResetBoundary,
  QueryClientProvider,
  HydrationBoundary,
}

import type {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  UseMutationResult,
  MutateOptions,
  UseSuspenseQueryOptions,
  UseSuspenseInfiniteQueryOptions,
} from "@tanstack/react-query"

import {isServer, FirstParam, PromiseReturnType, AsyncFunc} from "blitz"
import {
  emptyQueryFn,
  getQueryCacheFunctions,
  getQueryKey,
  QueryCacheFunctions,
  sanitizeQuery,
  sanitizeMutation,
  getInfiniteQueryKey,
  QueryType,
} from "../utils"
import {useRouter} from "next/compat/router"

type QueryLazyOptions = {suspense: unknown} | {enabled: unknown}
type QueryNonLazyOptions =
  | {suspense: true; enabled?: never}
  | {suspense?: never; enabled: true}
  | {suspense: true; enabled: true}
  | {suspense?: never; enabled?: never}

class NextError extends Error {
  digest?: string
}

// -------------------------
// useQuery
// -------------------------
export type RestQueryResult<TResult, TError> = Omit<UseQueryResult<TResult, TError>, "data"> &
  QueryCacheFunctions<TResult>

export function useQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options?: Omit<UseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> & QueryNonLazyOptions,
): [TSelectedData | undefined, RestQueryResult<TSelectedData | undefined, TError>]
export function useQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: Omit<UseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> & QueryLazyOptions,
): [TSelectedData | undefined, RestQueryResult<TSelectedData | undefined, TError>]
export function useQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: Omit<UseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> = {},
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  let enabled = isServer ? false : options?.enabled ?? options?.enabled !== null
  let routerIsReady = false
  const router = useRouter()
  if (router) {
    routerIsReady = router?.isReady || isServer
  } else {
    routerIsReady = true
  }
  const enhancedResolverRpcClient = sanitizeQuery(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? ({signal}) => enhancedResolverRpcClient(params, {fromQueryHook: true}, signal)
      : (emptyQueryFn as PromiseReturnType<T>),
    ...options,
    enabled,
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
  }

  return [data, rest]
}

// -------------------------
// useSuspenseQuery
// -------------------------

export function useSuspenseQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options?: Omit<UseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> & QueryNonLazyOptions,
): [TSelectedData, RestQueryResult<TSelectedData, TError>]
export function useSuspenseQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: Omit<UseSuspenseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> &
    QueryLazyOptions,
): [TSelectedData | undefined, RestQueryResult<TSelectedData, TError>]
export function useSuspenseQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: Omit<UseSuspenseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> = {},
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useQuery is missing the first argument - it must be a query function")
  }

  const enhancedResolverRpcClient = sanitizeQuery(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  let routerIsReady = false
  const router = useRouter()
  if (router) {
    routerIsReady = router?.isReady || isServer
  } else {
    routerIsReady = true
  }

  if (isServer) {
    const e = new NextError()
    e.name = "Rendering Suspense fallback..."
    e.digest = "DYNAMIC_SERVER_USAGE"
    // Backwards compatibility for nextjs 13.0.7
    e.message = "DYNAMIC_SERVER_USAGE"
    delete e.stack
    throw e
  }

  const {data, ...queryRest} = useSuspenseReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? ({signal}) => enhancedResolverRpcClient(params, {fromQueryHook: true}, signal)
      : (emptyQueryFn as PromiseReturnType<T>),
    ...options,
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, TResult, T>(queryFn, params),
  }

  return [data, rest]
}

// -------------------------
// usePaginatedQuery
// -------------------------
export type RestPaginatedResult<TResult, TError> = Omit<UseQueryResult<TResult, TError>, "data"> &
  QueryCacheFunctions<TResult>

export function usePaginatedQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options?: Omit<UseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> & QueryNonLazyOptions,
): [TSelectedData | undefined, RestPaginatedResult<TSelectedData, TError>]
export function usePaginatedQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: Omit<UseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> & QueryLazyOptions,
): [TSelectedData | undefined, RestPaginatedResult<TSelectedData, TError>]
export function usePaginatedQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  params: FirstParam<T>,
  options: Omit<UseQueryOptions<TResult, TError, TSelectedData>, "queryKey"> = {},
) {
  if (typeof queryFn === "undefined") {
    throw new Error("usePaginatedQuery is missing the first argument - it must be a query function")
  }

  let enabled = isServer ? false : options?.enabled ?? options?.enabled !== null
  let routerIsReady = false
  const router = useRouter()
  if (router) {
    routerIsReady = router?.isReady || isServer
  } else {
    routerIsReady = true
  }
  const enhancedResolverRpcClient = sanitizeQuery(queryFn)
  const queryKey = getQueryKey(queryFn, params)

  const {data, ...queryRest} = useReactQuery({
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? ({signal}) => enhancedResolverRpcClient(params, {fromQueryHook: true}, signal)
      : (emptyQueryFn as PromiseReturnType<T>),
    ...options,
    placeholderData: keepPreviousData,
    enabled,
  })

  if (queryRest.fetchStatus === "idle" && isServer && !data) {
    const e = new NextError()
    e.name = "Rendering Suspense fallback..."
    e.digest = "DYNAMIC_SERVER_USAGE"
    // Backwards compatibility for nextjs 13.0.7
    e.message = "DYNAMIC_SERVER_USAGE"
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
export interface RestInfiniteResult<TResult, TError>
  extends Omit<UseInfiniteQueryResult<TResult, TError>, "data">,
    QueryCacheFunctions<InfiniteData<TResult>> {
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
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: Omit<InfiniteQueryConfig<TResult, TError, TSelectedData>, "queryKey"> &
    QueryNonLazyOptions,
): [TSelectedData[] | undefined, RestInfiniteResult<TSelectedData, TError>]
export function useInfiniteQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: Omit<InfiniteQueryConfig<TResult, TError, TSelectedData>, "queryKey"> & QueryLazyOptions,
): [TSelectedData[] | undefined, RestInfiniteResult<TSelectedData, TError>]

export function useInfiniteQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: Omit<InfiniteQueryConfig<TResult, TError, TSelectedData>, "queryKey">,
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  let enabled = isServer ? false : options?.enabled ?? options?.enabled !== null
  let routerIsReady = false
  const router = useRouter()
  if (router) {
    routerIsReady = router?.isReady || isServer
  } else {
    routerIsReady = true
  }
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

  const infiniteQueryData = data as InfiniteData<TResult>

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, InfiniteData<TResult>, T>(queryFn, getQueryParams),
    pageParams: infiniteQueryData?.pageParams,
  }

  return [infiniteQueryData?.pages as any, rest]
}

// -------------------------
// useInfiniteQuery
// -------------------------
export interface RestInfiniteResult<TResult, TError>
  extends Omit<UseInfiniteQueryResult<TResult, TError>, "data">,
    QueryCacheFunctions<InfiniteData<TResult>> {
  pageParams: any
}

interface InfiniteQueryConfig<TResult, TError, TSelectedData>
  extends UseInfiniteQueryOptions<TResult, TError, TSelectedData, TResult> {
  // getPreviousPageParam?: (lastPage: TResult, allPages: TResult[]) => TGetPageParamResult
  // getNextPageParam?: (lastPage: TResult, allPages: TResult[]) => TGetPageParamResult
}

export function useSuspenseInfiniteQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: Omit<UseSuspenseInfiniteQueryOptions<TResult, TError, TSelectedData>, "queryKey"> &
    QueryNonLazyOptions,
): [TSelectedData[], RestInfiniteResult<TSelectedData, TError>]
export function useSuspenseInfiniteQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: Omit<UseSuspenseInfiniteQueryOptions<TResult, TError, TSelectedData>, "queryKey"> &
    QueryLazyOptions,
): [TSelectedData[] | undefined, RestInfiniteResult<TSelectedData, TError>]
export function useSuspenseInfiniteQuery<
  T extends AsyncFunc,
  TResult = PromiseReturnType<T>,
  TError = DefaultError,
  TSelectedData = TResult,
>(
  queryFn: T,
  getQueryParams: (pageParam: any) => FirstParam<T>,
  options: Omit<UseSuspenseInfiniteQueryOptions<TResult, TError, TSelectedData>, "queryKey">,
) {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  let routerIsReady = false
  const router = useRouter()
  if (router) {
    routerIsReady = router?.isReady || isServer
  } else {
    routerIsReady = true
  }
  const enhancedResolverRpcClient = sanitizeQuery(queryFn)
  const queryKey = getInfiniteQueryKey(queryFn, getQueryParams)

  const {data, ...queryRest} = useSuspenseInfiniteReactQuery({
    // we need an extra cache key for infinite loading so that the cache for
    // for this query is stored separately since the hook result is an array of results.
    // Without this cache for usePaginatedQuery and this will conflict and break.
    queryKey: routerIsReady ? queryKey : ["_routerNotReady_"],
    queryFn: routerIsReady
      ? ({pageParam, signal}) =>
          enhancedResolverRpcClient(getQueryParams(pageParam), {fromQueryHook: true}, signal)
      : (emptyQueryFn as any),
    ...options,
  })

  const infiniteQueryData = data as InfiniteData<TResult>

  if (queryRest.fetchStatus === "idle" && isServer && !infiniteQueryData) {
    const e = new NextError()
    e.name = "Rendering Suspense fallback..."
    e.digest = "DYNAMIC_SERVER_USAGE"
    // Backwards compatibility for nextjs 13.0.7
    e.message = "DYNAMIC_SERVER_USAGE"
    delete e.stack
    throw e
  }

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<FirstParam<T>, InfiniteData<TResult>, T>(
      queryFn,
      getQueryParams,
      QueryType.INFINITE,
    ),
    pageParams: infiniteQueryData?.pageParams,
  }

  return [infiniteQueryData?.pages as unknown, rest]
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
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  mutationResolver: MutationFunction<TData, TVariables>,
  config?: UseMutationOptions<TData, TError, TVariables, TContext>,
): MutationResultPair<TData, TError, TVariables, TContext> {
  const enhancedResolverRpcClient = sanitizeMutation(mutationResolver)

  const {mutate, mutateAsync, ...rest} = useReactQueryMutation<TData, TError, TVariables, TContext>(
    {
      mutationFn: (variables) => enhancedResolverRpcClient(variables, {fromQueryHook: true}),
      throwOnError: true,
      ...config,
    },
  )

  return [mutateAsync, rest] as MutationResultPair<TData, TError, TVariables, TContext>
}
