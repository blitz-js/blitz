import {render as defaultRender} from "@testing-library/react"
import {renderHook as defaultRenderHook} from "@testing-library/react-hooks"
import {RouterContext} from "next/dist/next-server/lib/router-context"
import {NextRouter} from "next/router"
import React from "react"
import {BlitzProvider} from "../src/blitz-provider"
import {queryClient} from "../src/utils/react-query-utils"

export * from "@testing-library/react"

// --------------------------------------------------
// Override the default test render with our own
//
// You can override the router mock like this:
//
// const { baseElement } = render(<MyComponent />, {
//   router: { pathname: '/my-custom-pathname' },
// });
// --------------------------------------------------
type DefaultParams = Parameters<typeof defaultRender>
type RenderUI = DefaultParams[0]
type RenderOptions = DefaultParams[1] & {
  router?: Partial<NextRouter>
  dehydratedState?: unknown
}

const mockRouter: NextRouter = {
  basePath: "",
  pathname: "/",
  route: "/",
  asPath: "/",
  query: {},
  isReady: true,
  isLocaleDomain: false,
  isPreview: false,
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
}

export function render(
  ui: RenderUI,
  {wrapper, router, dehydratedState, ...options}: RenderOptions = {},
) {
  if (!wrapper) {
    wrapper = ({children}) => (
      <BlitzProvider client={queryClient} dehydratedState={dehydratedState}>
        <RouterContext.Provider value={{...mockRouter, ...router}}>
          {children}
        </RouterContext.Provider>
      </BlitzProvider>
    )
  }

  return defaultRender(ui, {wrapper, ...options})
}

// --------------------------------------------------
// Override the default test renderHook with our own
//
// You can override the router mock like this:
//
// const result = renderHook(() => myHook(), {
//   router: { pathname: '/my-custom-pathname' },
// });
// --------------------------------------------------
type DefaultHookParams = Parameters<typeof defaultRenderHook>
type RenderHook = DefaultHookParams[0]
type RenderHookOptions = DefaultHookParams[1] & {
  router?: Partial<NextRouter>
  dehydratedState?: unknown
}

export function renderHook(
  hook: RenderHook,
  {wrapper, router, dehydratedState, ...options}: RenderHookOptions = {},
) {
  if (!wrapper) {
    wrapper = ({children}) => (
      <BlitzProvider client={queryClient} dehydratedState={dehydratedState}>
        <RouterContext.Provider value={{...mockRouter, ...router}}>
          {children}
        </RouterContext.Provider>
      </BlitzProvider>
    )
  }

  return defaultRenderHook(hook, {wrapper, ...options})
}

// This enhance fn does what getIsomorphicEnhancedResolver does during build time
export function enhanceQueryFn(fn: any) {
  const newFn = (...args: any) => {
    const [data, ...rest] = args
    return fn(data, ...rest)
  }
  newFn._meta = {
    name: "testResolver",
    type: "query",
    path: "app/test",
    apiUrl: "test/url",
  }
  return newFn
}

// This enhance fn does what getIsomorphicEnhancedResolver does during build time
export function enhanceMutationFn(fn: any) {
  const newFn = (...args: any) => fn(...args)
  newFn._meta = {
    name: "testResolver",
    type: "mutation",
    path: "app/test",
    apiUrl: "test/url",
  }
  return newFn
}
