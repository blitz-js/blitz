import {deserializeError} from "serialize-error"
import {queryCache} from "react-query"
import {getQueryKey} from "./utils"
import {ResolverModule, Middleware} from "./middleware"
import {
  antiCSRFStore,
  publicDataStore,
  HEADER_CSRF,
  HEADER_PUBLIC_DATA_TOKEN,
  HEADER_SESSION_REVOKED,
} from "./supertokens"

type Options = {
  fromQueryHook?: boolean
}

export async function executeRpcCall(url: string, params: any, opts: Options = {}) {
  if (typeof window === "undefined") return

  const headers: Record<string, any> = {
    "Content-Type": "application/json",
  }

  const antiCSRFToken = antiCSRFStore.getToken()
  if (antiCSRFToken) {
    headers[HEADER_CSRF] = antiCSRFToken
  }

  const result = await window.fetch(url, {
    method: "POST",
    headers,
    credentials: "include",
    redirect: "follow",
    body: JSON.stringify({params: params || null}),
  })

  if (result.headers) {
    for (const [name, value] of result.headers.entries()) {
      if (name.toLowerCase() === HEADER_CSRF) antiCSRFStore.setToken(value)
      if (name.toLowerCase() === HEADER_PUBLIC_DATA_TOKEN) publicDataStore.setToken(value)
      if (name.toLowerCase() === HEADER_SESSION_REVOKED) publicDataStore.clear()
    }
  }

  if (result.status === 401) {
    // Usually means csrf token is bad, but this should never happen
    antiCSRFStore.clear()
  }

  let json
  try {
    json = await result.json()
  } catch (error) {
    throw new Error(`Failed to parse json from request to ${url}`)
  }

  if (json.error) {
    const error = deserializeError(json.error)
    if (error.name === "AuthenticationError" && publicDataStore.getData().userId) {
      // We don't clear the publicDataStore for anonymous users
      publicDataStore.clear()
    }
    throw error
  } else {
    if (!opts.fromQueryHook) {
      const queryKey = getQueryKey(url, params)
      queryCache.setQueryData(queryKey, json.result)
    }
    return json.result
  }
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
export interface RpcFunction {
  (params: any, opts: any): Promise<any>
}
export interface EnhancedRpcFunction extends RpcFunction, ResolverEnhancement {}

export interface EnhancedResolverModule extends ResolverEnhancement {
  (input: any, ctx: Record<string, any>): Promise<unknown>
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
