import {ClientPlugin} from "./index-browser"
import {isClient} from "./utils"

export function merge<T, U>([...fns]: Array<(args: T) => U>) {
  return (args: T) => fns.map((fn) => fn(args))
}

export function pipe<T>(...fns: Array<(x: T) => T>) {
  return (x: T) => fns.reduce((v, f) => f(v), x)
}

export function reduceBlitzPlugins<TPlugins extends readonly ClientPlugin<object>[]>({
  plugins,
}: {
  plugins: TPlugins
}) {
  const {middleware, events, exports} = plugins.reduce(
    (acc, plugin) => ({
      middleware: {
        beforeHttpRequest: plugin.middleware.beforeHttpRequest
          ? pipe<RequestInit>(acc.middleware.beforeHttpRequest, plugin.middleware.beforeHttpRequest)
          : acc.middleware.beforeHttpRequest,
        beforeHttpResponse: plugin.middleware.beforeHttpResponse
          ? pipe<Response>(acc.middleware.beforeHttpResponse, plugin.middleware.beforeHttpResponse)
          : acc.middleware.beforeHttpResponse,
      },
      events: {
        onRpcError: plugin.events.onRpcError
          ? merge<Error, Promise<void>>([
              ...(Array.isArray(acc.events.onRpcError)
                ? acc.events.onRpcError
                : [acc.events.onRpcError]),
              plugin.events.onRpcError,
            ])
          : acc.events.onRpcError,
        onSessionCreated: plugin.events.onSessionCreated
          ? merge<void, Promise<void>>([
              ...(Array.isArray(acc.events.onSessionCreated)
                ? acc.events.onSessionCreated
                : [acc.events.onSessionCreated]),
              plugin.events.onSessionCreated,
            ])
          : acc.events.onSessionCreated,
      },
      exports: {...plugin.exports(), ...acc.exports},
    }),
    {
      middleware: {
        beforeHttpRequest: pipe<RequestInit>(),
        beforeHttpResponse: pipe<Response>(),
      },
      events: {
        onRpcError: merge<Error, Promise<void>>([]),
        onSessionCreated: merge<void, Promise<void>>([]),
      },
      exports: {},
    },
  )

  globalThis.__BLITZ_MIDDLEWARE_HOOKS = middleware

  if (isClient) {
    document.addEventListener("blitz:session-created", async () => {
      await Promise.all(events.onSessionCreated())
    })
    document.addEventListener("blitz:rpc-error", async (e) => {
      const customEvent = e as CustomEvent<Error>
      await Promise.all(events.onRpcError(customEvent.detail))
    })
  }

  return {
    exports,
    middleware,
    events,
  }
}
