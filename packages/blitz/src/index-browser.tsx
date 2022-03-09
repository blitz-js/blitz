import React from "react"

export function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

type TemporaryAny = any

// tood: should be constructed based on plugins
export type BlitzPage<P = {}, IP = P> = {
  getLayout?: (component: JSX.Element) => JSX.Element
  authenticate?: boolean | {redirectTo?: string}
  suppressFirstRenderFlicker?: boolean
  // redirectAuthenticatedTo?: RedirectAuthenticatedTo | RedirectAuthenticatedToFn
}

export type BlitzHoc = (Page: BlitzPage) => BlitzPage

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
  withProvider: BlitzHoc | null
}

export function createClientPlugin<TPluginOptions, TPluginExports extends object>(
  pluginConstructor: (options: TPluginOptions) => ClientPlugin<TPluginExports>,
) {
  return pluginConstructor
}

export * from "./utils"
export * from "./types"
