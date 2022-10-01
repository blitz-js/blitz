import "./global"
import {ComponentType} from "react"
import {IncomingMessage, ServerResponse} from "http"
import {AuthenticationError, AuthorizationError, NotFoundError, RedirectError} from "./errors"

export type BlitzProviderComponentType = <TProps = any>(
  component: ComponentType<TProps>,
) => {
  (props: TProps): JSX.Element
  displayName: string
}

export interface ClientPlugin<Exports extends object> {
  events: {
    onSessionCreate?: () => void
    onSessionDestroy?: () => void
    onBeforeRender?: (props: React.ComponentProps<any>) => void
  }
  middleware: {
    beforeHttpRequest?: (
      req: IncomingMessage,
      res: ServerResponse,
      next: (error?: Error) => Promise<void> | void,
    ) => void
    beforeHttpResponse?: (
      req: IncomingMessage,
      res: ServerResponse,
      next: (error?: Error) => Promise<void> | void,
    ) => void
  }
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
export * from "./errors"
export * from "./utils/zod"
export * from "./utils/prisma"
