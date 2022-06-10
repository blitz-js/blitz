import {normalizePathTrailingSlash} from "next/dist/client/normalize-trailing-slash"
import {addBasePath} from "next/dist/shared/lib/router/router"
import {deserialize, serialize} from "superjson"
import {SuperJSONResult} from "superjson/dist/types"
import {CSRFTokenMismatchError, isServer} from "blitz"
import {getQueryKeyFromUrlAndParams, queryClient} from "./react-query-utils"
import {
  getAntiCSRFToken,
  getPublicDataStore,
  HEADER_CSRF,
  HEADER_CSRF_ERROR,
  HEADER_PUBLIC_DATA_TOKEN,
  HEADER_SESSION_CREATED,
} from "@blitzjs/auth"

export function normalizeApiRoute(path: string): string {
  return normalizePathTrailingSlash(addBasePath(path))
}

export type ResolverType = "query" | "mutation"

export interface BuildRpcClientParams {
  resolverName: string
  resolverType: ResolverType
  routePath: string
}

export interface RpcOptions {
  fromQueryHook?: boolean
  fromInvoke?: boolean
  alreadySerialized?: boolean
}

export interface EnhancedRpc {
  _isRpcClient: true
  _resolverType: ResolverType
  _resolverName: string
  _routePath: string
}

export interface RpcClientBase<Input = unknown, Result = unknown> {
  (params: Input, opts?: RpcOptions): Promise<Result>
}

export interface RpcClient<Input = unknown, Result = unknown>
  extends EnhancedRpc,
    RpcClientBase<Input, Result> {}

// export interface RpcResolver<Input = unknown, Result = unknown> extends EnhancedRpc {
//   (params: Input, ctx?: Ctx): Promise<Result>
// }

export function __internal_buildRpcClient({
  resolverName,
  resolverType,
  routePath,
}: BuildRpcClientParams): RpcClient {
  const fullRoutePath = normalizeApiRoute("/api/rpc" + routePath)

  const httpClient: RpcClientBase = async (params, opts = {}) => {
    const debug = (await import("debug")).default("blitz:rpc")
    if (!opts.fromQueryHook && !opts.fromInvoke) {
      console.warn(
        "[Deprecation] Directly calling queries/mutations is deprecated in favor of invoke(queryFn, params)",
      )
    }

    if (isServer) {
      return Promise.resolve() as unknown
    }
    debug("Starting request for", fullRoutePath, "with", params, "and", opts)

    const headers: Record<string, any> = {
      "Content-Type": "application/json",
    }

    const antiCSRFToken = getAntiCSRFToken()
    if (antiCSRFToken) {
      debug("Adding antiCSRFToken cookie header", antiCSRFToken)
      headers[HEADER_CSRF] = antiCSRFToken
    } else {
      debug("No antiCSRFToken cookie found")
    }

    let serialized: SuperJSONResult
    if (opts.alreadySerialized) {
      // params is already serialized with superjson when it gets here
      // We have to serialize the params before passing to react-query in the query key
      // because otherwise react-query will use JSON.parse(JSON.stringify)
      // so by the time the arguments come here the real JS objects are lost
      serialized = params as unknown as SuperJSONResult
    } else {
      serialized = serialize(params)
    }

    // Create a new AbortController instance for this request
    const controller = new AbortController()

    const promise = window
      .fetch(fullRoutePath, {
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
        debug("Received request for", routePath)
        if (response.headers) {
          if (response.headers.get(HEADER_PUBLIC_DATA_TOKEN)) {
            getPublicDataStore().updateState()
            debug("Public data updated")
          }
          if (response.headers.get(HEADER_SESSION_CREATED)) {
            // This also runs on logout, because on logout a new anon session is created
            debug("Session created")
            setTimeout(async () => {
              // Do these in the next tick to prevent various bugs like https://github.com/blitz-js/blitz/issues/2207
              debug("Invalidating react-query cache...")
              await queryClient.cancelQueries()
              await queryClient.resetQueries()
              queryClient.getMutationCache().clear()
              // We have a 100ms delay here to prevent unnecessary stale queries from running
              // This prevents the case where you logout on a page with
              // Page.authenticate = {redirectTo: '/login'}
              // Without this delay, queries that require authentication on the original page
              // will still run (but fail because you are now logged out)
              // Ref: https://github.com/blitz-js/blitz/issues/1935
            }, 100)
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
          ;(error as any).path = routePath
          error.stack = null!
          throw error
        } else {
          let payload
          try {
            payload = await response.json()
          } catch (error) {
            const err = new Error(`Failed to parse json from ${routePath}`)
            err.stack = null!
            throw err
          }

          if (payload.error) {
            let error = deserialize({
              json: payload.error,
              meta: payload.meta?.error,
            }) as any
            // We don't clear the publicDataStore for anonymous users,
            // because there is not sensitive data
            if (error.name === "AuthenticationError" && getPublicDataStore().getData().userId) {
              getPublicDataStore().clear()
            }

            const prismaError = error.message.match(/invalid.*prisma.*invocation/i)
            if (prismaError && !("code" in error)) {
              error = new Error(prismaError[0])
              error.statusCode = 500
            }

            error.stack = null
            throw error
          } else {
            const data = deserialize({
              json: payload.result,
              meta: payload.meta?.result,
            })

            if (!opts.fromQueryHook) {
              const queryKey = getQueryKeyFromUrlAndParams(routePath, params)
              queryClient.setQueryData(queryKey, data)
            }
            return data
          }
        }
      })

    return promise
  }

  const rpcClient = httpClient as RpcClient

  rpcClient._isRpcClient = true
  rpcClient._resolverName = resolverName
  rpcClient._resolverType = resolverType
  rpcClient._routePath = fullRoutePath

  return rpcClient
}
