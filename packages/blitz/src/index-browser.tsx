import "./global"
import {ComponentType} from "react"
import {
  AuthenticationError,
  AuthorizationError,
  CSRFTokenMismatchError,
  NotFoundError,
  PaginationArgumentError,
  RedirectError,
} from "./errors"
import type {EventHooks, MiddlewareHooks} from "./types"
import {isClient, merge, pipe} from "./utils"
export {
  AuthenticationError,
  AuthorizationError,
  CSRFTokenMismatchError,
  NotFoundError,
  PaginationArgumentError,
  RedirectError,
}

export type BlitzProviderComponentType = <TProps = any>(
  component: ComponentType<TProps>,
) => {
  (props: TProps): JSX.Element
  displayName: string
}
export interface ClientPlugin<Exports extends object> {
  events: EventHooks
  middleware: MiddlewareHooks
  exports: () => Exports
  withProvider?: BlitzProviderComponentType
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

export function createClientPlugin<TPluginOptions, TPluginExports extends object>(
  pluginConstructor: (options: TPluginOptions) => ClientPlugin<TPluginExports>,
) {
  return pluginConstructor
}

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  function onUnhandledError(ev: ErrorEvent) {
    if (
      ev.error instanceof RedirectError ||
      ev.error instanceof AuthenticationError ||
      ev.error instanceof AuthorizationError ||
      ev.error instanceof NotFoundError
    ) {
      // This prevents 'Uncaught error' logs in the console.
      // This doesn't change how React or error boundaries handle errors
      ev.preventDefault()
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("error", onUnhandledError)

    if ("Cypress" in window) {
      // Hide some errors from Cypress, so they don't fail Cypress tests
      // https://github.com/cypress-io/cypress/issues/7196

      const cypressOnErrorFun = window.onerror

      window.onerror = (message, source, lineno, colno, err) => {
        if (
          cypressOnErrorFun &&
          !(
            err instanceof RedirectError ||
            err instanceof AuthenticationError ||
            err instanceof AuthorizationError ||
            err instanceof NotFoundError
          )
        ) {
          cypressOnErrorFun(message, source, lineno, colno, err)
        }
      }
    }
  }
}

export * from "./utils"
export * from "./types"
export * from "./utils/enhance-prisma"
export * from "./utils/zod"
