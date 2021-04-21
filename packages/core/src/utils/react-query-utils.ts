import {QueryClient, QueryKey} from "react-query"
import {serialize} from "superjson"
import {getBlitzRuntimeData} from "../blitz-data"
import {EnhancedResolverRpcClient, QueryFn, Resolver, ResolverType} from "../types"
import {isClient} from "."
import {requestIdleCallback} from "./request-idle-callback"

type MutateOptions = {
  refetch?: boolean
}

export const initializeQueryClient = () => {
  let suspenseEnabled = true
  if (!process.env.CLI_COMMAND_CONSOLE && !process.env.CLI_COMMAND_DB) {
    const data = getBlitzRuntimeData()
    suspenseEnabled = data.suspenseEnabled
  }

  return new QueryClient({
    defaultOptions: {
      queries: {
        suspense: !!suspenseEnabled,
        retry: (failureCount, error: any) => {
          if (process.env.NODE_ENV !== "production") return false

          // Retry (max. 3 times) only if network error detected
          if (error.message === "Network request failed" && failureCount <= 3) return true

          return false
        },
      },
    },
  })
}

// Create internal QueryClient instance
export const queryClient = initializeQueryClient()

function isEnhancedResolverRpcClient(f: any): f is EnhancedResolverRpcClient<any, any> {
  return !!f._meta
}

export interface QueryCacheFunctions<T> {
  setQueryData: (
    newData: T | ((oldData: T | undefined) => T),
    opts?: MutateOptions,
  ) => ReturnType<typeof setQueryData>
}

export const getQueryCacheFunctions = <TInput, TResult, T extends QueryFn>(
  resolver: T | Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
  params: TInput,
): QueryCacheFunctions<TResult> => ({
  setQueryData: (newData, opts = {refetch: true}) => {
    return setQueryData(resolver, params, newData, opts)
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

const isNotInUserTestEnvironment = () => {
  if (process.env.JEST_WORKER_ID === undefined) return true
  if (process.env.BLITZ_TEST_ENVIRONMENT !== undefined) return true
  return false
}

export const validateQueryFn = <TInput, TResult>(
  queryFn: Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
) => {
  if (!isEnhancedResolverRpcClient(queryFn) && isNotInUserTestEnvironment()) {
    throw new Error(
      `Either the file path to your resolver is incorrect (must be in a "queries" or "mutations" folder that isn't nested inside "pages" or "api") or you are trying to use Blitz's useQuery to fetch from third-party APIs (to do that, import useQuery directly from "react-query")`,
    )
  }
}

const sanitize = (type: ResolverType) => <TInput, TResult>(
  queryFn: Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
) => {
  validateQueryFn(queryFn)

  const enhancedResolver = queryFn as EnhancedResolverRpcClient<TInput, TResult>

  const queryFnName = type === "mutation" ? "useMutation" : "useQuery"

  if (enhancedResolver._meta?.type !== type && isNotInUserTestEnvironment()) {
    throw new Error(
      `"${queryFnName}" was expected to be called with a ${type} but was called with a "${enhancedResolver._meta.type}"`,
    )
  }

  return enhancedResolver
}

export const sanitizeQuery = sanitize("query")
export const sanitizeMutation = sanitize("mutation")

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

  return getQueryKeyFromUrlAndParams(sanitizeQuery(resolver)._meta.apiUrl, params)
}

export function invalidateQuery<TInput, TResult, T extends QueryFn>(
  resolver: T | Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
  params?: TInput,
) {
  if (typeof resolver === "undefined") {
    throw new Error(
      "invalidateQuery is missing the first argument - it must be a resolver function",
    )
  }

  const fullQueryKey = getQueryKey(resolver, params)
  let queryKey: QueryKey
  if (params) {
    queryKey = fullQueryKey
  } else {
    // Params not provided, only use first query key item (url)
    queryKey = fullQueryKey[0]
  }
  return queryClient.invalidateQueries(queryKey)
}

export function setQueryData<TInput, TResult, T extends QueryFn>(
  resolver: T | Resolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>,
  params: TInput,
  newData: TResult | ((oldData: TResult | undefined) => TResult),
  opts: MutateOptions = {refetch: true},
): Promise<void | ReturnType<typeof queryClient.invalidateQueries>> {
  if (typeof resolver === "undefined") {
    throw new Error("setQueryData is missing the first argument - it must be a resolver function")
  }
  const queryKey = getQueryKey(resolver, params)

  return new Promise((res) => {
    queryClient.setQueryData(queryKey, newData)
    let result: void | ReturnType<typeof queryClient.invalidateQueries>
    if (opts.refetch) {
      result = invalidateQuery(resolver, params)
    }
    if (isClient) {
      // Fix for https://github.com/blitz-js/blitz/issues/1174
      requestIdleCallback(() => {
        res(result)
      })
    } else {
      res(result)
    }
  })
}
