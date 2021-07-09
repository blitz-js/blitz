import { normalizeApiRoute } from '../next-server/lib/router/router'
import { deserialize, serialize } from 'superjson'
import { SuperJSONResult } from 'superjson/dist/types'
// import {getAntiCSRFToken} from "./auth/auth-client"
// import {getPublicDataStore} from "./auth/public-data-store"
// import {getBlitzRuntimeData} from "./blitz-data"
// import {
//   HEADER_CSRF,
//   HEADER_CSRF_ERROR,
//   HEADER_PUBLIC_DATA_TOKEN,
//   HEADER_SESSION_CREATED,
//   HEADER_SESSION_REVOKED,
// } from "./constants"
// import {CSRFTokenMismatchError} from "./errors"
// import {
//   CancellablePromise,
//   EnhancedResolver,
//   EnhancedResolverRpcClient,
//   ResolverModule,
//   ResolverRpc,
//   ResolverType,
//   RpcOptions,
// } from "./types"
// import {getQueryKeyFromUrlAndParams, queryClient} from "./utils/react-query-utils"
const debug = require('debug')('blitz:rpc')

const isServer = typeof window === 'undefined'
const isClient = !isServer

interface BuildRpcClientParams {
  resolverName: string
  routePath: string
}

export interface RpcOptions {
  fromQueryHook?: boolean
  fromInvoke?: boolean
  alreadySerialized?: boolean
}

export function buildRpcClient({
  resolverName,
  routePath,
}: BuildRpcClientParams) {
  return function rpcClient(params: any, opts: RpcOptions = {}) {
    if (!opts.fromQueryHook && !opts.fromInvoke) {
      console.warn(
        '[Deprecation] Directly calling queries/mutations is deprecated in favor of invoke(queryFn, params)'
      )
    }

    if (isServer) {
      return Promise.resolve() as unknown // as CancellablePromise<TResult>
    }
    const fullRoutePath = normalizeApiRoute(routePath)
    debug('Starting request for', fullRoutePath, 'with', params, 'and', opts)

    const headers: Record<string, any> = {
      'Content-Type': 'application/json',
    }

    // const antiCSRFToken = getAntiCSRFToken()
    // if (antiCSRFToken) {
    //   debug('Adding antiCSRFToken cookie header', antiCSRFToken)
    //   headers[HEADER_CSRF] = antiCSRFToken
    // } else {
    //   debug('No antiCSRFToken cookie found')
    // }

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
      .fetch(fullRoutePath, {
        method: 'POST',
        headers,
        credentials: 'include',
        redirect: 'follow',
        body: JSON.stringify({
          params: serialized.json,
          meta: {
            params: serialized.meta,
          },
        }),
        signal: controller.signal,
      })
      .then(async (response) => {
        debug('Received request for', routePath)
        // if (response.headers) {
        //   if (response.headers.get(HEADER_PUBLIC_DATA_TOKEN)) {
        //     getPublicDataStore().updateState()
        //     debug('Public data updated')
        //   }
        //   if (response.headers.get(HEADER_SESSION_REVOKED)) {
        //     debug('Session revoked, clearing publicData')
        //     getPublicDataStore().clear()
        //     setTimeout(async () => {
        //       // Do these in the next tick to prevent various bugs like https://github.com/blitz-js/blitz/issues/2207
        //       debug('Clearing and invalidating react-query cache...')
        //       await queryClient.cancelQueries()
        //       await queryClient.resetQueries()
        //       queryClient.getMutationCache().clear()
        //       // We have a 100ms delay here to prevent unnecessary stale queries from running
        //       // This prevents the case where you logout on a page with
        //       // Page.authenticate = {redirectTo: '/login'}
        //       // Without this delay, queries that require authentication on the original page
        //       // will still run (but fail because you are now logged out)
        //       // Ref: https://github.com/blitz-js/blitz/issues/1935
        //     }, 100)
        //   }
        //   if (response.headers.get(HEADER_SESSION_CREATED)) {
        // clientDebug("Session created")
        // // await queryClient.invalidateQueries("")
        // setTimeout(async () => {
        //   // Do these in the next tick to prevent various bugs like https://github.com/blitz-js/blitz/issues/2207
        //   clientDebug("Invalidating react-query cache...")
        //   await queryClient.cancelQueries()
        //   await queryClient.resetQueries()
        // })
        //   }
        //   if (response.headers.get(HEADER_CSRF_ERROR)) {
        //     const err = new CSRFTokenMismatchError()
        //     err.stack = null!
        //     throw err
        //   }
        // }

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
            // We don't clear the publicDataStore for anonymous users
            // if (
            //   error.name === 'AuthenticationError' &&
            //   getPublicDataStore().getData().userId
            // ) {
            //   getPublicDataStore().clear()
            // }

            const prismaError = error.message.match(
              /invalid.*prisma.*invocation/i
            )
            if (prismaError && !('code' in error)) {
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

            // if (!opts.fromQueryHook) {
            //   const queryKey = getQueryKeyFromUrlAndParams(routePath, params)
            //   queryClient.setQueryData(queryKey, data)
            // }
            return data
          }
        }
      }) // as CancellablePromise<TResult>

    // Disable react-query request cancellation for now
    // Having too many weird bugs with it enabled
    // promise.cancel = () => controller.abort()

    return promise
  }
}

// executeRpcCall.warm = (routePath: string) => {
//   if (!isClient) {
//     return
//   }
//
//   return window.fetch(addBasePath(apiUrl), { method: 'HEAD' })
// }

// const ensureTrailingSlash = (url: string) => {
//   const lastChar = url.substr(-1)
//   if (lastChar !== '/') {
//     url = url + '/'
//   }
//   return url
// }

// const getApiUrlFromResolverFilePath = (resolverFilePath: string) => {
//   const url = resolverFilePath.replace(/^app\/_resolvers/, '/api')
//   return getBlitzRuntimeData().trailingSlash ? ensureTrailingSlash(url) : url
// }
