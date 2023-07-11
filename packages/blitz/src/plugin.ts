import type {
  BlitzProviderComponentType,
  ClientPlugin,
  Simplify,
  UnionToIntersection,
} from "./index-browser"
import {BlitzServerPlugin} from "./index-server"
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

export type ClientPluginsExports<TPlugins extends readonly ClientPlugin<object>[]> = Simplify<
  UnionToIntersection<
    {
      [I in keyof TPlugins & number]: ReturnType<TPlugins[I]["exports"]>
    }[number]
  >
>

export type ServerPluginsExports<TPlugins extends readonly BlitzServerPlugin<object>[]> = Simplify<
  UnionToIntersection<
    {
      [I in keyof TPlugins & number]: ReturnType<TPlugins[I]["exports"]>
    }[number]
  >
>

export function reduceBlitzClientPlugins<TPlugins extends readonly ClientPlugin<object>[]>({
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
      exports: {} as ClientPluginsExports<TPlugins>,
      providers: [] as BlitzProviderComponentType[],
    },
  )

  globalThis.__BLITZ_MIDDLEWARE_HOOKS = middleware

  if (isClient) {
    if (globalThis.__BLITZ_CLEAN_UP_LISTENERS) {
      globalThis.__BLITZ_CLEAN_UP_LISTENERS()
    }
    const onSessionCreated = async () => {
      await Promise.all(events.onSessionCreated())
    }
    const onRpcError = async (e: Event): Promise<void> => {
      const customEvent = e as CustomEvent<Error>
      await Promise.all(events.onRpcError(customEvent.detail))
    }
    document.addEventListener("blitz:session-created", onSessionCreated)
    document.addEventListener("blitz:rpc-error", onRpcError)

    globalThis.__BLITZ_CLEAN_UP_LISTENERS = () => {
      document.removeEventListener("blitz:session-created", onSessionCreated)
      document.removeEventListener("blitz:rpc-error", onRpcError)
    }
  }

  const withPlugins = compose(...providers)

  return {
    exports,
    middleware,
    events,
    withPlugins,
  }
}

export function reduceBlitzServerPlugins<TPlugins extends readonly BlitzServerPlugin<object>[]>({
  plugins,
}: {
  plugins: TPlugins
}) {
  const middlewares = plugins.flatMap((p) => p.requestMiddlewares)
  const contextMiddleware = plugins.flatMap((p) => p.contextMiddleware).filter(Boolean)
  const {pluginExports} = plugins.reduce(
    (acc, plugin) => ({
      pluginExports: {...plugin.exports(), ...acc.pluginExports},
    }),
    {
      pluginExports: {} as ServerPluginsExports<TPlugins>,
    },
  )
  return {pluginExports, middlewares, contextMiddleware}
}
