import React from "react"
import {render as defaultRender} from "@testing-library/react"
import {renderHook as defaultRenderHook} from "@testing-library/react-hooks"
import {RouterContext} from "next/dist/next-server/lib/router-context"
import {NextRouter} from "next/router"

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
type RenderOptions = DefaultParams[1] & {router?: Partial<NextRouter>}

const mockRouter: NextRouter = {
  basePath: "",
  pathname: "/",
  route: "/",
  asPath: "/",
  query: {},
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

export function render(ui: RenderUI, {wrapper, router, ...options}: RenderOptions = {}) {
  if (!wrapper) {
    wrapper = ({children}) => (
      <RouterContext.Provider value={{...mockRouter, ...router}}>{children}</RouterContext.Provider>
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
type RenderHookOptions = DefaultHookParams[1] & {router?: Partial<NextRouter>}

export function renderHook(
  hook: RenderHook,
  {wrapper, router, ...options}: RenderHookOptions = {},
) {
  if (!wrapper) {
    wrapper = ({children}) => (
      <RouterContext.Provider value={{...mockRouter, ...router}}>{children}</RouterContext.Provider>
    )
  }

  return defaultRenderHook(hook, {wrapper, ...options})
}
