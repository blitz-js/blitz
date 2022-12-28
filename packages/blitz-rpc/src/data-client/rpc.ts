import {normalizePathTrailingSlash} from "next/dist/client/normalize-trailing-slash"
import {addBasePath} from "next/dist/client/add-base-path"
import {deserialize, serialize, stringify} from "superjson"
import {SuperJSONResult} from "superjson/dist/types"
import {isServer} from "blitz"
import {getQueryKeyFromUrlAndParams, getQueryClient} from "./react-query-utils"

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

    if (httpMethod === "GET" && serialized.json) {
      routePathURL.searchParams.set("params", stringify(serialized.json))
      routePathURL.searchParams.set("meta", stringify(serialized.meta))
    }

    const {beforeHttpRequest, beforeHttpResponse} = globalThis.__BLITZ_MIDDLEWARE_HOOKS

    const promise = window
      .fetch(
        routePathURL,
        beforeHttpRequest({
          method: httpMethod,
          headers: {
            "Content-Type": "application/json",
          },
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
        }),
      )
      .then(async (response) => {
        debug("Received request for", routePath)
        response = beforeHttpResponse(response)
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
            const rpcEvent = new CustomEvent("blitz:rpc-error", {
              detail: error,
            })
            document.dispatchEvent(rpcEvent)
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
