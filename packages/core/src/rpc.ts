import {deserializeError} from "serialize-error"
import {queryCache} from "react-query"
import {getQueryKey} from "./utils"
import {ResolverModule, Middleware} from "./middleware"
import {LOCALSTORAGE_PREFIX, HEADER_CSRF, HEADER_PUBLIC_DATA_TOKEN} from "./supertokens"

type Options = {
  fromQueryHook?: boolean
}

export async function executeRpcCall(url: string, params: any, opts: Options = {}) {
  if (typeof window === "undefined") return

  const headers: Record<string, any> = {
    "Content-Type": "application/json",
  }

  const antiCSRFToken = localStorage.getItem(LOCALSTORAGE_PREFIX + HEADER_CSRF)
  if (antiCSRFToken) {
    headers[HEADER_CSRF] = antiCSRFToken
  }

  const result = await window.fetch(url, {
    method: "POST",
    headers,
    credentials: "same-origin",
    redirect: "follow",
    body: JSON.stringify({params}),
  })

  // TODO TODO TODO - not being saved to localstorage
  const newAntiCSRFToken = result.headers.get(HEADER_CSRF)
  if (newAntiCSRFToken) {
    localStorage.setItem(LOCALSTORAGE_PREFIX + HEADER_CSRF, newAntiCSRFToken)
  }
  const publicDataToken = result.headers.get(HEADER_PUBLIC_DATA_TOKEN)
  if (publicDataToken) {
    localStorage.setItem(LOCALSTORAGE_PREFIX + HEADER_PUBLIC_DATA_TOKEN, publicDataToken)
  }

  let json
  try {
    json = await result.json()
  } catch (error) {
    throw new Error(`Failed to parse json from request to ${url}`)
  }

  if (json.error) {
    const error = deserializeError(json.error)
    if (error.name === "AuthenticationError") {
      localStorage.removeItem(LOCALSTORAGE_PREFIX + HEADER_CSRF)
      localStorage.removeItem(LOCALSTORAGE_PREFIX + HEADER_PUBLIC_DATA_TOKEN)
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
