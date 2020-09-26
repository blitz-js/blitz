import {
  useInfiniteQuery as useInfiniteReactQuery,
  InfiniteQueryResult,
  InfiniteQueryConfig as RQInfiniteQueryConfig,
} from "react-query"
import {emptyQueryFn, retryFunction} from "./use-query"
import {Resolver} from "./types"
import {getQueryCacheFunctions, QueryCacheFunctions, getInfiniteQueryKey} from "./utils/query-cache"
import {EnhancedRpcFunction} from "./rpc"

type RestQueryResult<TResult> = Omit<InfiniteQueryResult<TResult>, "resolvedData"> &
  QueryCacheFunctions<TResult>

const isServer = typeof window === "undefined"

interface InfiniteQueryConfig<TResult, TFetchMoreResult> extends RQInfiniteQueryConfig<TResult> {
  getFetchMore?: (lastPage: TResult, allPages: TResult[]) => TFetchMoreResult
}

// TODO - Fix TFetchMoreResult not actually taking affect in apps.
// It shows as 'unknown' in the params() input argumunt, but should show as TFetchMoreResult
export function useInfiniteQuery<TInput, TResult, TFetchMoreResult>(
  queryFn: Resolver<TInput, TResult>,
  params: (fetchMoreResult: TFetchMoreResult) => TInput,
  options: InfiniteQueryConfig<TResult, TFetchMoreResult>,
): [TResult[], RestQueryResult<TResult>] {
  if (typeof queryFn === "undefined") {
    throw new Error("useInfiniteQuery is missing the first argument - it must be a query function")
  }

  const queryRpcFn = isServer ? emptyQueryFn : ((queryFn as unknown) as EnhancedRpcFunction)

  const queryKey = getInfiniteQueryKey(queryFn)

  const {data, ...queryRest} = useInfiniteReactQuery({
    queryKey,
    queryFn: (_infinite: boolean, _apiUrl: string, resultOfGetFetchMore: TFetchMoreResult) =>
      queryRpcFn(params(resultOfGetFetchMore), {fromQueryHook: true}),
    config: {
      suspense: true,
      retry: retryFunction,
      ...options,
    },
  })

  const rest = {
    ...queryRest,
    ...getQueryCacheFunctions<TResult>(queryKey),
  }

  return [data as TResult[], rest as RestQueryResult<TResult>]
}
