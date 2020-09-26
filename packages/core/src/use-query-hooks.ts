import {
  useQuery as useReactQuery,
  QueryResult,
  QueryConfig,
  usePaginatedQuery as usePaginatedReactQuery,
  PaginatedQueryResult,
  PaginatedQueryConfig,
  useInfiniteQuery as useInfiniteReactQuery,
  InfiniteQueryResult,
  InfiniteQueryConfig as RQInfiniteQueryConfig,
} from "react-query"
import {Resolver, EnhancedResolverRpcClient} from "./types"
import {
  QueryCacheFunctions,
  getQueryCacheFunctions,
  getQueryKey,
  sanitize,
  getInfiniteQueryKey,
  defaultQueryConfig,
} from "./utils/react-query-utils"

// -------------------------
// useQuery
// -------------------------
type RestQueryResult<TResult> = Omit<QueryResult<TResult>, "data"> & QueryCacheFunctions<TResult>

export function useQuery<TInput, TResult>(
  queryFn: Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
  params: TInput,
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
    ...getQueryCacheFunctions<TResult>(queryKey),
  }

  return [data as TResult, rest as RestQueryResult<TResult>]
}

// -------------------------
// usePaginatedQuery
// -------------------------
type RestPaginatedResult<TResult> = Omit<PaginatedQueryResult<TResult>, "resolvedData"> &
  QueryCacheFunctions<TResult>

export function usePaginatedQuery<TInput, TResult>(
  queryFn: Resolver<TInput, TResult>,
  params: TInput,
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
    ...getQueryCacheFunctions<TResult>(queryKey),
  }

  return [resolvedData as TResult, rest as RestPaginatedResult<TResult>]
}

// -------------------------
// useInfiniteQuery
// -------------------------
type RestInfiniteResult<TResult> = Omit<InfiniteQueryResult<TResult>, "resolvedData"> &
  QueryCacheFunctions<TResult>

// TODO - Fix TFetchMoreResult not actually taking affect in apps.
// It shows as 'unknown' in the params() input argumunt, but should show as TFetchMoreResult
interface InfiniteQueryConfig<TResult, TFetchMoreResult> extends RQInfiniteQueryConfig<TResult> {
  getFetchMore?: (lastPage: TResult, allPages: TResult[]) => TFetchMoreResult
}

export function useInfiniteQuery<TInput, TResult, TFetchMoreResult>(
  queryFn: Resolver<TInput, TResult>,
  params: (fetchMoreResult: TFetchMoreResult) => TInput,
  options: InfiniteQueryConfig<TResult, TFetchMoreResult>,
): [TResult[], RestInfiniteResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  const enhancedResolverRpcClient = sanitize(queryFn)
  const queryKey = getInfiniteQueryKey(queryFn)

  const {data, ...queryRest} = useInfiniteReactQuery({
    queryKey,
    queryFn: (_infinite: boolean, _apiUrl: string, resultOfGetFetchMore: TFetchMoreResult) =>
      enhancedResolverRpcClient(params(resultOfGetFetchMore), {fromQueryHook: true}),
    config: {
      ...defaultQueryConfig,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<TResult>(queryKey),
  }

  return [data as TResult[], rest as RestInfiniteResult<TResult>]
}
