import {deserializeError} from "serialize-error"
import {queryCache} from "react-query"
import {getQueryKey} from "./utils"
import {ResolverModule, Middleware} from "./middleware"
import {
  getAntiCSRFToken,
  publicDataStore,
  HEADER_CSRF,
  HEADER_SESSION_REVOKED,
  HEADER_CSRF_ERROR,
  HEADER_PUBLIC_DATA_TOKEN,
} from "./supertokens"
import {CSRFTokenMismatchError} from "./errors"
import {serialize, deserialize} from "superjson"
import merge from "deepmerge"

type Options = {
  fromQueryHook?: boolean
  resultOfGetFetchMore?: any
}

export function executeRpcCall(url: string, params: any, opts: Options = {}) {
  if (typeof window === "undefined") return

  const headers: Record<string, any> = {
    "Content-Type": "application/json",
  }

  const antiCSRFToken = getAntiCSRFToken()
  if (antiCSRFToken) {
    headers[HEADER_CSRF] = antiCSRFToken
  }

  let serialized
  if (opts.fromQueryHook) {
    // We have to serialize query arguments inside the hooks, otherwise react-query will use
    // JSON.parse(JSON.stringify) so by the time the arguments come here the real JS objects are lost
    serialized = params
    if (opts.resultOfGetFetchMore) {
      // useInfiniteQuery usually passes in extra pageParams here that come from getFetchMore()
      // This isn't serialized inside useInfiniteQuery because this data is provided separately
      // by react-query
      serialized = merge(params, serialize(opts.resultOfGetFetchMore))
    }
  } else {
    serialized = serialize(params)
  }

  // Create a new AbortController instance for this request
  const controller = new AbortController()

  const promise: CancellablePromise<any> = window
    .fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      redirect: "follow",
      body: JSON.stringify({
        // TODO remove `|| null` once superjson allows `undefined`
        params: serialized.json || null,
        meta: {
          params: serialized.meta,
        },
      }),
      signal: controller.signal,
    })
    .then(async (result) => {
      if (result.headers) {
        if (result.headers.get(HEADER_PUBLIC_DATA_TOKEN)) {
          publicDataStore.updateState()
        }
        if (result.headers.get(HEADER_SESSION_REVOKED)) {
          publicDataStore.clear()
        }
        if (result.headers.get(HEADER_CSRF_ERROR)) {
          throw new CSRFTokenMismatchError()
        }
      }

      let payload
      try {
        payload = await result.json()
      } catch (error) {
        throw new Error(`Failed to parse json from request to ${url}`)
      }

      if (payload.error) {
        const error = deserializeError(payload.error)
        // We don't clear the publicDataStore for anonymous users
        if (error.name === "AuthenticationError" && publicDataStore.getData().userId) {
          publicDataStore.clear()
        }
        throw error
      } else {
        const data =
          payload.result === undefined
            ? undefined
            : deserialize({json: payload.result, meta: payload.meta?.result})

        if (!opts.fromQueryHook) {
          const queryKey = getQueryKey(url, params)
          queryCache.setQueryData(queryKey, data)
        }
        return data
      }
    })

  promise.cancel = () => controller.abort()

  return promise
}

executeRpcCall.warm = (url: string) => {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    window.fetch(url, {method: "HEAD"})
  }
}

interface ResolverEnhancement {
  _meta: {
    name: string
    type: string
    path: string
    apiUrl: string
  }
}

interface CancellablePromise<T> extends Promise<T> {
  cancel?: Function
}

export interface RpcFunction {
  (params: any, opts: any): CancellablePromise<any>
}
export interface EnhancedRpcFunction extends RpcFunction, ResolverEnhancement {}

export interface EnhancedResolverModule extends ResolverEnhancement {
  (input: any, ctx: Record<string, any>): CancellablePromise<unknown>
  middleware?: Middleware[]
}

export function getIsomorphicRpcHandler(
  resolver: ResolverModule,
  resolverPath: string,
  resolverName: string,
  resolverType: string,
) {
  const apiUrl = resolverPath.replace(/^app\/_resolvers/, "/api")
  const enhance = <T extends ResolverEnhancement>(fn: T): T => {
    fn._meta = {
      name: resolverName,
      type: resolverType,
      path: resolverPath,
      apiUrl: apiUrl,
    }
    return fn
  }

  if (typeof window !== "undefined") {
    let rpcFn: EnhancedRpcFunction = ((params: any, opts = {}) =>
      executeRpcCall(apiUrl, params, opts)) as any

    rpcFn = enhance(rpcFn)

    // Warm the lambda
    executeRpcCall.warm(apiUrl)

    return rpcFn
  } else {
    let handler: EnhancedResolverModule = resolver.default as any

    handler.middleware = resolver.middleware
    handler = enhance(handler)

    return handler
  }
}
