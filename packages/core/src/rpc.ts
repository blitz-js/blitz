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
import {AuthenticationError} from "./errors"
import {serialize, deserialize} from "superjson"
import {
  ResolverType,
  ResolverModule,
  EnhancedResolver,
  EnhancedResolverRpcClient,
  CancellablePromise,
  ResolverRpc,
  RpcOptions,
} from "./types"
import {SuperJSONResult} from "superjson/dist/types"

export const executeRpcCall = <TInput, TResult>(
  apiUrl: string,
  params: TInput,
  opts: RpcOptions = {},
) => {
  if (isServer) return (Promise.resolve() as unknown) as CancellablePromise<TResult>

  const headers: Record<string, any> = {
    "Content-Type": "application/json",
  }

  const antiCSRFToken = getAntiCSRFToken()
  if (antiCSRFToken) {
    console.log("Adding antiCSRFToken cookie header", antiCSRFToken)
    headers[HEADER_CSRF] = antiCSRFToken
  } else {
    console.log("No antiCSRFToken cookie found")
  }

  let serialized: SuperJSONResult
  if (opts.alreadySerialized) {
    // params is already serialized with superjson when it gets here
    // We have to serialize the params before passing to react-query in the query key
    // because otherwise react-query will use JSON.parse(JSON.stringify)
    // so by the time the arguments come here the real JS objects are lost
    serialized = (params as unknown) as SuperJSONResult
  } else {
    serialized = serialize(params)
  }

  // Create a new AbortController instance for this request
  const controller = new AbortController()

  const promise = window
    .fetch(apiUrl, {
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
          throw new AuthenticationError()
        }
      }

      let payload
      try {
        payload = await result.json()
      } catch (error) {
        throw new Error(`Failed to parse json from request to ${apiUrl}`)
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
          const queryKey = getQueryKey(apiUrl, params)
          queryCache.setQueryData(queryKey, data)
        }
        return data as TResult
      }
    }) as CancellablePromise<TResult>

  // Disable react-query request cancellation for now
  // Having too many weird bugs with it enabled
  // promise.cancel = () => controller.abort()

  return promise
}

executeRpcCall.warm = (apiUrl: string) => {
  if (isClient) {
    return window.fetch(apiUrl, {method: "HEAD"})
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
export function getIsomorphicEnhancedResolver<TInput, TResult>(
  // resolver is undefined on the client
  resolver: ResolverModule<TInput, TResult> | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
): EnhancedResolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>
export function getIsomorphicEnhancedResolver<TInput, TResult>(
  // resolver is undefined on the client
  resolver: ResolverModule<TInput, TResult> | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "client",
): EnhancedResolverRpcClient<TInput, TResult>
export function getIsomorphicEnhancedResolver<TInput, TResult>(
  // resolver is undefined on the client
  resolver: ResolverModule<TInput, TResult> | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "server",
): EnhancedResolver<TInput, TResult>
export function getIsomorphicEnhancedResolver<TInput, TResult>(
  // resolver is undefined on the client
  resolver: ResolverModule<TInput, TResult> | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "server" | "client" = isClient ? "client" : "server",
): EnhancedResolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult> {
  const apiUrl = getApiUrlFromResolverFilePath(resolverFilePath)

  if (target === "client") {
    const resolverRpc: ResolverRpc<TInput, TResult> = (params, opts) =>
      executeRpcCall(apiUrl, params, opts)
    const enhancedResolverRpcClient = resolverRpc as EnhancedResolverRpcClient<TInput, TResult>

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
    const enhancedResolver = (resolver.default as unknown) as EnhancedResolver<TInput, TResult>
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
