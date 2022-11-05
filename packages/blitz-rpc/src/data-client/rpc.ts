import {normalizePathTrailingSlash} from "next/dist/client/normalize-trailing-slash"
import {addBasePath} from "next/dist/client/add-base-path"
import {deserialize, serialize} from "superjson"
import {SuperJSONResult} from "superjson/dist/types"
import {CSRFTokenMismatchError, isServer} from "blitz"
import {getQueryKeyFromUrlAndParams, getQueryClient} from "./react-query-utils"
import {stringify} from "superjson"
import {getAntiCSRFToken} from "../index-browser"

export function normalizeApiRoute(path: string): string {
  return normalizePathTrailingSlash(addBasePath(path))
}

export type ResolverType = "query" | "mutation"

export interface BuildRpcClientParams {
  resolverName: string
  resolverType: ResolverType
  routePath: string
  httpMethod: string
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
  (params: Input, opts?: RpcOptions, signal?: AbortSignal): Promise<Result>
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
  httpMethod,
}: BuildRpcClientParams): RpcClient {
  const fullRoutePath = normalizeApiRoute("/api/rpc" + routePath)
  const routePathURL = new URL(fullRoutePath, window.location.origin)
  const httpClient: RpcClientBase = async (params, opts = {}, signal = undefined) => {
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
    console.log("Blitz Auth Enabled:", globalThis.__BLITZ_AUTH_ENABLED) // For Testing
    if (globalThis.__BLITZ_AUTH_ENABLED) {
      try {
        const {getAntiCSRFToken, HEADER_CSRF} = await import("@blitzjs/auth")
        const antiCSRFToken = getAntiCSRFToken()
        if (antiCSRFToken) {
          debug("Adding antiCSRFToken cookie header", antiCSRFToken)
          headers[HEADER_CSRF] = antiCSRFToken
        } else {
          debug("No antiCSRFToken cookie found")
        }
      } catch (e: any) {
        if (e.code === "MODULE_NOT_FOUND") {
          console.error(
            "Blitz Auth is enabled but @blitzjs/auth is not installed. Please check if @blitzjs/auth is in your dependencies",
          )
        }
        throw e
      }
    } else if (globalThis.__BLITZ_RPC_CSRF_OPTIONS) {
      const antiCSRFToken = getAntiCSRFToken(globalThis.__BLITZ_RPC_CSRF_OPTIONS)
      if (antiCSRFToken) {
        debug("Adding antiCSRFToken cookie header", antiCSRFToken)
        headers["anti-csrf"] = antiCSRFToken
      } else {
        debug("No antiCSRFToken cookie found")
      }
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

    if (httpMethod === "GET") {
      routePathURL.searchParams.set("params", stringify(serialized.json))
      routePathURL.searchParams.set("meta", stringify(serialized.meta))
    }

    const promise = window
      .fetch(routePathURL, {
        method: httpMethod,
        headers,
        credentials: "include",
        redirect: "follow",
        body:
          httpMethod === "POST"
            ? JSON.stringify({
                params: serialized.json,
                meta: {
                  params: serialized.meta,
                },
              })
            : undefined,
        signal,
      })
      .then(async (response) => {
        debug("Received request for", routePath)
        if (response.headers) {
          if (globalThis.__BLITZ_AUTH_ENABLED) {
            try {
              const {
                HEADER_PUBLIC_DATA_TOKEN,
                backupAntiCSRFTokenToLocalStorage,
                HEADER_SESSION_CREATED,
                getPublicDataStore,
                HEADER_CSRF_ERROR,
              } = await import("@blitzjs/auth")
              backupAntiCSRFTokenToLocalStorage()
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
                  await getQueryClient().cancelQueries()
                  await getQueryClient().resetQueries()
                  getQueryClient().getMutationCache().clear()
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
            } catch (e: any) {
              if (e.code === "MODULE_NOT_FOUND") {
                console.error(
                  "Blitz Auth is enabled but @blitzjs/auth is not installed. Please check if @blitzjs/auth is in your dependencies",
                )
              }
              throw e
            }
          } else if (globalThis.__BLITZ_RPC_CSRF_OPTIONS) {
            const antiCSRFToken = response.headers.get("anti-csrf")
            const antiCSRFTokenFromCookie = getAntiCSRFToken(globalThis.__BLITZ_RPC_CSRF_OPTIONS)
            if (antiCSRFTokenFromCookie !== antiCSRFToken) {
              if (!antiCSRFToken) {
                console.warn(
                  `This request is missing the anti-csrf header. You can learn about adding this here: https://blitzjs.com/docs/session-management#manual-api-requests`,
                )
              }
              const err = new CSRFTokenMismatchError()
              err.stack = null!
              throw err
            }
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
            if (
              error.name === "AuthenticationError" &&
              (window as any).__publicDataStore.getData().userId
            ) {
              ;(window as any).__publicDataStore.clear()
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
              getQueryClient().setQueryData(queryKey, data)
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
