import {QueryClient, QueryFilters} from "@tanstack/react-query"
import {serialize} from "superjson"
import {isClient, isServer, AsyncFunc} from "blitz"
import {ResolverType, RpcClient} from "./rpc"

export type Resolver<TInput, TResult> = (input: TInput, ctx?: any) => Promise<TResult>

type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: () => number
}

export const requestIdleCallback =
  (typeof self !== "undefined" &&
    self.requestIdleCallback &&
    self.requestIdleCallback.bind(window)) ||
  function (cb: (deadline: RequestIdleCallbackDeadline) => void): NodeJS.Timeout {
    let start = Date.now()
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start))
        },
      })
    }, 1)
  }

type MutateOptions = {
  refetch?: boolean
}

export const initializeQueryClient = () => {
  let suspenseEnabled = true
  if (!process.env.CLI_COMMAND_CONSOLE && !process.env.CLI_COMMAND_DB) {
    suspenseEnabled = Boolean(globalThis.__BLITZ_SUSPENSE_ENABLED)
  }

  return new QueryClient({
    defaultOptions: {
      queries: {
        ...(isServer && {cacheTime: 0}),
        suspense: suspenseEnabled,
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

// Query client is initialised in `BlitzRpcPlugin`, and can only be used with BlitzRpcPlugin right now
export const getQueryClient = () => globalThis.queryClient

function isRpcClient(f: any): f is RpcClient<any, any> {
  return !!f._isRpcClient
}

export interface QueryCacheFunctions<T> {
  setQueryData: (
    newData: T | ((oldData: T | undefined) => T),
    opts?: MutateOptions,
  ) => ReturnType<typeof setQueryData>
}

export const getQueryCacheFunctions = <TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params: TInput,
): QueryCacheFunctions<TResult> => ({
  setQueryData: (newData, opts = {refetch: true}) => {
    return setQueryData(resolver, params, newData, opts)
  },
})

export const emptyQueryFn: RpcClient<unknown, unknown> = (() => {
  const fn = (() => new Promise(() => {})) as any as RpcClient
  fn._isRpcClient = true
  return fn
})()

const isNotInUserTestEnvironment = () => {
  if (process.env.JEST_WORKER_ID === undefined) return true
  if (process.env.BLITZ_TEST_ENVIRONMENT !== undefined) return true
  return false
}

export const validateQueryFn = <TInput, TResult>(
  queryFn: Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
) => {
  if (isClient && !isRpcClient(queryFn) && isNotInUserTestEnvironment()) {
    throw new Error(
      `Either the file path to your resolver is incorrect (must be in a "queries" or "mutations" folder that isn't nested inside "pages" or "api") or you are trying to use Blitz's useQuery to fetch from third-party APIs (to do that, import useQuery directly from "@tanstack/react-query").`,
    )
  }
}

const sanitize =
  (type: ResolverType) =>
  <TInput, TResult>(
    queryFn: Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  ): RpcClient<TInput, TResult> => {
    if (isServer) return queryFn as any

    validateQueryFn(queryFn)

    const rpcClient = queryFn as RpcClient<TInput, TResult>

    const queryFnName = type === "mutation" ? "useMutation" : "useQuery"

    if (rpcClient._resolverType !== type && isNotInUserTestEnvironment()) {
      throw new Error(
        `"${queryFnName}" was expected to be called with a ${type} but was called with a "${rpcClient._resolverType}"`,
      )
    }

    return rpcClient
  }

export const sanitizeQuery = sanitize("query")
export const sanitizeMutation = sanitize("mutation")

export const getQueryKeyFromUrlAndParams = (url: string, params: unknown) => {
  const queryKey = [url]

  const args = typeof params === "function" ? (params as Function)() : params
  queryKey.push(serialize(args) as any)

  return queryKey as [string, any]
}

export function getQueryKey<TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params?: TInput,
) {
  if (typeof resolver === "undefined") {
    throw new Error("getQueryKey is missing the first argument - it must be a resolver function")
  }

  return getQueryKeyFromUrlAndParams(sanitizeQuery(resolver)._routePath, params)
}

export function getInfiniteQueryKey<TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params?: TInput,
) {
  if (typeof resolver === "undefined") {
    throw new Error(
      "getInfiniteQueryKey is missing the first argument - it must be a resolver function",
    )
  }

  const queryKey = getQueryKeyFromUrlAndParams(sanitizeQuery(resolver)._routePath, params)
  return [...queryKey, "infinite"]
}

export function invalidateQuery<TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params?: TInput,
) {
  if (typeof resolver === "undefined") {
    throw new Error(
      "invalidateQuery is missing the first argument - it must be a resolver function",
    )
  }

  const fullQueryKey = getQueryKey(resolver, params)
  return getQueryClient().invalidateQueries(fullQueryKey)
}

export function setQueryData<TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params: TInput,
  newData: TResult | ((oldData: TResult | undefined) => TResult),
  opts: MutateOptions = {refetch: true},
): Promise<void | ReturnType<ReturnType<typeof getQueryClient>["invalidateQueries"]>> {
  if (typeof resolver === "undefined") {
    throw new Error("setQueryData is missing the first argument - it must be a resolver function")
  }
  const queryKey = getQueryKey(resolver, params)

  return new Promise((res) => {
    getQueryClient().setQueryData(queryKey, newData)
    let result: void | ReturnType<ReturnType<typeof getQueryClient>["invalidateQueries"]>
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

export function getQueryData<TInput, TResult, T extends AsyncFunc>(
  resolver: T | Resolver<TInput, TResult> | RpcClient<TInput, TResult>,
  params: TInput,
): TResult | undefined {
  if (typeof resolver === "undefined") {
    throw new Error("getQueryData is missing the first argument - it must be a resolver function")
  }
  const queryKey = getQueryKey(resolver, params)

  return getQueryClient().getQueryData(queryKey)
}
