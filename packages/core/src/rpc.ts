import {deserializeError} from "serialize-error"
import {queryCache} from "react-query"
import {getQueryKey, isClient, isServer} from "./utils"
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
import {
  ResolverType,
  ResolverModule,
  EnhancedResolver,
  EnhancedResolverRpcClient,
  CancellablePromise,
  ResolverRpc,
  ResolverRpcExecutor,
} from "./types"
import {SuperJSONResult} from "superjson/dist/types"

export const executeRpcCall: ResolverRpcExecutor<unknown, unknown> = (url, params, opts = {}) => {
  if (isServer) return Promise.resolve()

  const headers: Record<string, any> = {
    "Content-Type": "application/json",
  }

  const antiCSRFToken = getAntiCSRFToken()
  if (antiCSRFToken) {
    headers[HEADER_CSRF] = antiCSRFToken
  }

  let serialized: SuperJSONResult
  if (opts.alreadySerialized) {
    // params is already serialized with superjson when it gets here
    // We have to serialize the params before passing to react-query in the query key
    // because otherwise react-query will use JSON.parse(JSON.stringify)
    // so by the time the arguments come here the real JS objects are lost
    serialized = params as SuperJSONResult
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
        params: serialized.json,
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
  if (isClient) {
    return window.fetch(url, {method: "HEAD"})
  } else {
    return
  }
}

const getApiUrlFromResolverFilePath = (resolverFilePath: string) =>
  resolverFilePath.replace(/^app\/_resolvers/, "/api")

/*
 * Overloading signature so you can specify server/client and get the
 * correct return type
 */
export function getIsomorphicEnhancedResolver(
  // resolver is undefined on the client
  resolver: ResolverModule | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
): EnhancedResolver<unknown, unknown> | EnhancedResolverRpcClient
export function getIsomorphicEnhancedResolver(
  // resolver is undefined on the client
  resolver: ResolverModule | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "client",
): EnhancedResolverRpcClient
export function getIsomorphicEnhancedResolver(
  // resolver is undefined on the client
  resolver: ResolverModule | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "server",
): EnhancedResolver<unknown, unknown>
export function getIsomorphicEnhancedResolver(
  // resolver is undefined on the client
  resolver: ResolverModule | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "server" | "client" = isClient ? "client" : "server",
): EnhancedResolver<unknown, unknown> | EnhancedResolverRpcClient {
  const apiUrl = getApiUrlFromResolverFilePath(resolverFilePath)

  if (target === "client") {
    const resolverRpc: ResolverRpc<unknown, unknown> = (params, opts) =>
      executeRpcCall(apiUrl, params, opts)
    const enhancedResolverRpcClient = resolverRpc as EnhancedResolverRpcClient

    enhancedResolverRpcClient._meta = {
      name: resolverName,
      type: resolverType,
      filePath: resolverFilePath,
      apiUrl: apiUrl,
    }

    // Warm the lambda
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    executeRpcCall.warm(apiUrl)

    return enhancedResolverRpcClient
  } else {
    if (!resolver) throw new Error("resolver is missing on the server")
    const enhancedResolver = (resolver.default as unknown) as EnhancedResolver<unknown, unknown>
    enhancedResolver.middleware = resolver.middleware
    enhancedResolver._meta = {
      name: resolverName,
      type: resolverType,
      filePath: resolverFilePath,
      apiUrl: apiUrl,
    }
    return enhancedResolver
  }
}
