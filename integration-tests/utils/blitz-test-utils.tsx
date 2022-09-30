import React from "react"
import {vi} from "vitest"
import {QueryClient} from "@tanstack/react-query"
import {BlitzRpcPlugin, QueryClientProvider} from "@blitzjs/rpc"
import {NextRouter} from "next/router"
import {RouterContext} from "next/dist/shared/lib/router-context"
import {render as defaultRender} from "@testing-library/react"

export const mockRouter: NextRouter = {
  basePath: "",
  pathname: "/",
  route: "/",
  asPath: "/",
  query: {},
  isReady: true,
  isLocaleDomain: false,
  isPreview: false,
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
}

type DefaultParams = Parameters<typeof defaultRender>
type RenderUI = DefaultParams[0]
type RenderOptions = DefaultParams[1] & {
  router?: Partial<NextRouter>
}
export type BlitzProviderProps = {
  client?: QueryClient
  contextSharing?: boolean
}

const BlitzProvider = ({
  client,
  contextSharing = false,
  children,
}: BlitzProviderProps & {children: JSX.Element}) => {
  if (globalThis.queryClient) {
    return (
      <QueryClientProvider
        client={client || globalThis.queryClient}
        contextSharing={contextSharing}
      >
        {children}
      </QueryClientProvider>
    )
  }

  return children
}

const compose =
  (...rest) =>
  (x: React.ComponentType<any>) =>
    rest.reduceRight((y, f) => f(y), x)

const BlitzWrapper = ({plugins, children}) => {
  const providers = plugins.reduce((acc, plugin) => {
    return plugin.withProvider ? acc.concat(plugin.withProvider) : acc
  }, [])
  const withPlugins = compose(...providers)
  const component = React.useMemo(() => withPlugins(children), [children])

  return (
    <BlitzProvider>
      <RouterContext.Provider value={{...mockRouter}}>{component}</RouterContext.Provider>
    </BlitzProvider>
  )
}

export function render(ui: RenderUI, {wrapper, router, ...options}: RenderOptions = {}) {
  if (!wrapper) {
    wrapper = ({children}) => {
      return <BlitzWrapper plugins={[BlitzRpcPlugin({})]}>{children}</BlitzWrapper>
    }
  }

  return defaultRender(ui, {wrapper, ...options})
}

// This enhance fn does what buildRpcFunction does during build time
export function buildQueryRpc(fn: any) {
  const newFn = (...args: any) => {
    const [data, ...rest] = args
    return fn(data, ...rest)
  }
  newFn._isRpcClient = true
  newFn._resolverType = "query"
  newFn._routePath = "/api/test/url/" + Math.random()
  return newFn
}

// This enhance fn does what buildRpcFunction does during build time
export function buildMutationRpc(fn: any) {
  const newFn = (...args: any) => fn(...args)
  newFn._isRpcClient = true
  newFn._resolverType = "mutation"
  newFn._routePath = "/api/test/url"
  return newFn
}
