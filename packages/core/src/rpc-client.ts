import {addBasePath} from "next/dist/next-server/lib/router/router"
import {deserialize, serialize} from "superjson"
import {SuperJSONResult} from "superjson/dist/types"
import {getAntiCSRFToken} from "./auth/auth-client"
import {publicDataStore} from "./auth/public-data-store"
import {getBlitzRuntimeData} from "./blitz-data"
import {
  HEADER_CSRF,
  HEADER_CSRF_ERROR,
  HEADER_PUBLIC_DATA_TOKEN,
  HEADER_SESSION_CREATED,
  HEADER_SESSION_REVOKED,
} from "./constants"
import {CSRFTokenMismatchError} from "./errors"
import {
  CancellablePromise,
  EnhancedResolver,
  EnhancedResolverRpcClient,
  ResolverModule,
  ResolverRpc,
  ResolverType,
  RpcOptions,
} from "./types"
import {clientDebug, isClient, isServer} from "./utils"
import {getQueryKeyFromUrlAndParams, queryClient} from "./utils/react-query-utils"

export const executeRpcCall = <TInput, TResult>(
  apiUrl: string,
  params: TInput,
  opts: RpcOptions = {},
) => {
  if (!opts.fromQueryHook && !opts.fromInvoke) {
    console.warn(
      "[Deprecation] Directly calling queries/mutations is deprecated in favor of invoke(queryFn, params)",
    )
  }

  if (isServer) return (Promise.resolve() as unknown) as CancellablePromise<TResult>
  clientDebug("Starting request for", apiUrl, "with", params, "and", opts)

  const headers: Record<string, any> = {
    "Content-Type": "application/json",
  }

  const antiCSRFToken = getAntiCSRFToken()
  if (antiCSRFToken) {
    clientDebug("Adding antiCSRFToken cookie header", antiCSRFToken)
    headers[HEADER_CSRF] = antiCSRFToken
  } else {
    clientDebug("No antiCSRFToken cookie found")
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
    .fetch(addBasePath(apiUrl), {
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
    .then(async (response) => {
      clientDebug("Received request for", apiUrl)
      if (response.headers) {
        if (response.headers.get(HEADER_PUBLIC_DATA_TOKEN)) {
          publicDataStore.updateState()
          clientDebug("Public data updated")
        }
        if (response.headers.get(HEADER_SESSION_REVOKED)) {
          clientDebug("Session revoked")
          setTimeout(async () => {
            // Do these in the next tick to prevent various bugs like #2207
            await queryClient.cancelQueries()
            await queryClient.resetQueries()
            queryClient.getMutationCache().clear()
            publicDataStore.clear()
          }, 0)
        }
        if (response.headers.get(HEADER_SESSION_CREATED)) {
          clientDebug("Session created")
          await queryClient.invalidateQueries("")
        }
        if (response.headers.get(HEADER_CSRF_ERROR)) {
          const err = new CSRFTokenMismatchError()
          err.stack = null!
          throw err
        }
      }

      if (!response.ok) {
        const error = new Error(response.statusText)
        ;(error as any).statusCode = response.status
        ;(error as any).path = apiUrl
        error.stack = null!
        throw error
      } else {
        let payload
        try {
          payload = await response.json()
        } catch (error) {
          const err = new Error(`Failed to parse json from ${apiUrl}`)
          err.stack = null!
          throw err
        }

        if (payload.error) {
          let error = deserialize({json: payload.error, meta: payload.meta?.error}) as any
          // We don't clear the publicDataStore for anonymous users
          if (error.name === "AuthenticationError" && publicDataStore.getData().userId) {
            publicDataStore.clear()
          }

          const prismaError = error.message.match(/invalid.*prisma.*invocation/i)
          if (prismaError && !("code" in error)) {
            error = new Error(prismaError[0])
            error.statusCode = 500
          }

          error.stack = null
          throw error
        } else {
          const data = deserialize({json: payload.result, meta: payload.meta?.result})

          if (!opts.fromQueryHook) {
            const queryKey = getQueryKeyFromUrlAndParams(apiUrl, params)
            queryClient.setQueryData(queryKey, data)
          }
          return data as TResult
        }
      }
    }) as CancellablePromise<TResult>

  // Disable react-query request cancellation for now
  // Having too many weird bugs with it enabled
  // promise.cancel = () => controller.abort()

  return promise
}

executeRpcCall.warm = (apiUrl: string) => {
  if (!isClient) {
    return
  }

  return window.fetch(addBasePath(apiUrl), {method: "HEAD"})
}

const ensureTrailingSlash = (url: string) => {
  const lastChar = url.substr(-1)
  if (lastChar !== "/") {
    url = url + "/"
  }
  return url
}

const getApiUrlFromResolverFilePath = (resolverFilePath: string) => {
  const url = resolverFilePath.replace(/^app\/_resolvers/, "/api")
  return getBlitzRuntimeData().trailingSlash ? ensureTrailingSlash(url) : url
}

type IsomorphicEnhancedResolverOptions = {
  warmApiEndpoints?: boolean
}

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
  target?: undefined,
  options?: IsomorphicEnhancedResolverOptions,
): EnhancedResolver<TInput, TResult> | EnhancedResolverRpcClient<TInput, TResult>
export function getIsomorphicEnhancedResolver<TInput, TResult>(
  // resolver is undefined on the client
  resolver: ResolverModule<TInput, TResult> | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "client",
  options?: IsomorphicEnhancedResolverOptions,
): EnhancedResolverRpcClient<TInput, TResult>
export function getIsomorphicEnhancedResolver<TInput, TResult>(
  // resolver is undefined on the client
  resolver: ResolverModule<TInput, TResult> | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "server",
  options?: IsomorphicEnhancedResolverOptions,
): EnhancedResolver<TInput, TResult>
export function getIsomorphicEnhancedResolver<TInput, TResult>(
  // resolver is undefined on the client
  resolver: ResolverModule<TInput, TResult> | undefined,
  resolverFilePath: string,
  resolverName: string,
  resolverType: ResolverType,
  target: "server" | "client" = isClient ? "client" : "server",
  options: IsomorphicEnhancedResolverOptions = {},
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
    if (options.warmApiEndpoints) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      executeRpcCall.warm(apiUrl)
    }

    return enhancedResolverRpcClient
  } else {
    if (!resolver) throw new Error("resolver is missing on the server")
    const enhancedResolver = (resolver.default as unknown) as EnhancedResolver<TInput, TResult>
    enhancedResolver.middleware = resolver.middleware
    enhancedResolver.config = resolver.config
    enhancedResolver._meta = {
      name: resolverName,
      type: resolverType,
      filePath: resolverFilePath,
      apiUrl: apiUrl,
    }
    return enhancedResolver
  }
}
