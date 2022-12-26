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

export type BlitzPluginWithProvider = (x: React.ComponentType<any>) => React.ComponentType<any>

export interface ClientPlugin<Exports extends object> {
  events: EventHooks
  middleware: MiddlewareHooks
  exports: () => Exports
  withProvider?: BlitzProviderComponentType
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
export {reduceBlitzPlugins} from "./plugin"
