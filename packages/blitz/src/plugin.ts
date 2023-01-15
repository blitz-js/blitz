import type {
  BlitzProviderComponentType,
  ClientPlugin,
  Simplify,
  UnionToIntersection,
} from "./index-browser"
import {isClient} from "./utils"

export function merge<T, U>([...fns]: Array<(args: T) => U>) {
  return (args: T) => fns.map((fn) => fn(args))
}

export function pipe<T>(...fns: Array<(x: T) => T>) {
  return (x: T) => fns.reduce((v, f) => f(v), x)
}

const compose =
  (...rest: BlitzProviderComponentType[]) =>
  (x: React.ComponentType<any>) =>
    rest.reduceRight((y, f) => f(y), x)

export type PluginsExports<TPlugins extends readonly ClientPlugin<object>[]> = Simplify<
  UnionToIntersection<
    {
      [I in keyof TPlugins & number]: ReturnType<TPlugins[I]["exports"]>
    }[number]
  >
>

export function reduceBlitzPlugins<TPlugins extends readonly ClientPlugin<object>[]>({
  plugins,
}: {
  plugins: TPlugins
}) {
  const {middleware, events, exports, providers} = plugins.reduce(
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
      providers: plugin.withProvider ? acc.providers.concat(plugin.withProvider) : acc.providers,
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
      exports: {} as PluginsExports<TPlugins>,
      providers: [] as BlitzProviderComponentType[],
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

  const withPlugins = compose(...providers)

  return {
    exports,
    middleware,
    events,
    withPlugins,
  }
}
