import {queryCache} from "react-query"
import {deserialize, serialize} from "superjson"
import {SuperJSONResult} from "superjson/dist/types"
import {
  HEADER_CSRF,
  HEADER_CSRF_ERROR,
  HEADER_PUBLIC_DATA_TOKEN,
  HEADER_SESSION_CREATED,
  HEADER_SESSION_REVOKED,
} from "./constants"
import {CSRFTokenMismatchError} from "./errors"
import {publicDataStore} from "./public-data-store"
import {getAntiCSRFToken} from "./supertokens"
import {
  CancellablePromise,
  EnhancedResolver,
  EnhancedResolverRpcClient,
  Middleware,
  Resolver,
  ResolverModule,
  ResolverRpc,
  ResolverType,
  RpcOptions,
} from "./types"
import {clientDebug, isClient, isServer} from "./utils"
import {getQueryKeyFromUrlAndParams} from "./utils/react-query-utils"

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
  clientDebug("Starting request for", apiUrl)

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
    .then(async (response) => {
      clientDebug("Received request for", apiUrl)
      if (response.headers) {
        if (response.headers.get(HEADER_PUBLIC_DATA_TOKEN)) {
          publicDataStore.updateState()
          clientDebug("Public data updated")
        }
        if (response.headers.get(HEADER_SESSION_REVOKED)) {
          clientDebug("Session revoked")
          queryCache.clear()
          publicDataStore.clear()
        }
        if (response.headers.get(HEADER_SESSION_CREATED)) {
          clientDebug("Session created")
          queryCache.clear()
        }
        if (response.headers.get(HEADER_CSRF_ERROR)) {
          const err = new CSRFTokenMismatchError()
          delete err.stack
          throw err
        }
      }

      if (!response.ok) {
        const error = new Error(response.statusText)
        ;(error as any).statusCode = response.status
        ;(error as any).path = apiUrl
        delete error.stack
        throw error
      } else {
        let payload
        try {
          payload = await response.json()
        } catch (error) {
          const err = new Error(`Failed to parse json from ${apiUrl}`)
          delete err.stack
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

          throw error
        } else {
          const data = deserialize({json: payload.result, meta: payload.meta?.result})

          if (!opts.fromQueryHook) {
            const queryKey = getQueryKeyFromUrlAndParams(apiUrl, params)
            queryCache.setQueryData(queryKey, data)
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

  return window.fetch(apiUrl, {method: "HEAD"})
}

const getApiPathFromResolverFilePath = (resolverFilePath: string) =>
  resolverFilePath.replace(/^\/app/, "/api")

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
  const apiPath = getApiPathFromResolverFilePath(resolverFilePath)

  if (target === "client") {
    const resolverRpc: ResolverRpc<TInput, TResult> = (params, opts) =>
      executeRpcCall(apiPath, params, opts)
    const enhancedResolverRpcClient = resolverRpc as EnhancedResolverRpcClient<TInput, TResult>

    enhancedResolverRpcClient._meta = {
      name: resolverName,
      type: resolverType,
      filePath: resolverFilePath,
      apiPath: apiPath,
    }

    // Warm the lambda
    if (options.warmApiEndpoints) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      executeRpcCall.warm(apiPath)
    }

    return enhancedResolverRpcClient
  } else {
    if (!resolver) throw new Error("resolver is missing on the server")
    const enhancedResolver = (resolver.default as unknown) as EnhancedResolver<TInput, TResult>
    enhancedResolver.middleware = resolver.middleware
    enhancedResolver._meta = {
      name: resolverName,
      type: resolverType,
      filePath: resolverFilePath,
      apiPath: apiPath,
    }
    return enhancedResolver
  }
}

function extractResolverMetadata(filePath: string) {
  const [, typePlural, name] = /(queries|mutations)\/(.*)$/.exec(filePath) || []

  const type: ResolverType = typePlural === "mutations" ? "mutation" : "query"

  return {
    name,
    type,
    filePath,
    apiPath: filePath.replace(/^app/, "pages/api"),
  }
}

interface EnhancedResolverData {
  filePath: string
  middleware?: Middleware[]
}
export function enhanceResolver<TInput, TResult>(
  resolver: Resolver<TInput, TResult>,
  data: EnhancedResolverData,
) {
  const enhancedResolver = resolver as EnhancedResolver<TInput, TResult>
  enhancedResolver.middleware = data.middleware
  enhancedResolver._meta = extractResolverMetadata(data.filePath)
  return enhancedResolver
}
