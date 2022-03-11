import React, {ComponentType} from "react"
import {IncomingMessage, ServerResponse} from "http"

export type BlitzProvider = <TProps = any>(
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
  withProvider?: BlitzProvider
}

export function createClientPlugin<TPluginOptions, TPluginExports extends object>(
  pluginConstructor: (options: TPluginOptions) => ClientPlugin<TPluginExports>,
) {
  return pluginConstructor
}

export * from "./utils"
export * from "./ts-utils"
export * from "./types"
export * from "./errors"
