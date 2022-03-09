import React, {ComponentType} from "react"

export function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

type TemporaryAny = any

export interface ClientPlugin<Exports extends object> {
  events: {
    onSessionCreate?: () => void
    onSessionDestroy?: () => void
    onBeforeRender?: (props: React.ComponentProps<any>) => void
  }
  middleware: {
    beforeHttpRequest: (req: TemporaryAny, res: TemporaryAny, next: () => void) => void
    beforeHttpResponse: (req: TemporaryAny, res: TemporaryAny, next: () => void) => void
  }
  exports: () => Exports
  withProvider: (component: ComponentType) => {
    (props: any): JSX.Element
    displayName: string
  }
}

export function createClientPlugin<TPluginOptions, TPluginExports extends object>(
  pluginConstructor: (options: TPluginOptions) => ClientPlugin<TPluginExports>,
) {
  return pluginConstructor
}

export * from "./utils"
export * from "./types"
