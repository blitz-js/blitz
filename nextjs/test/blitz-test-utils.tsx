import { render as defaultRender } from '@testing-library/react'
import { renderHook as defaultRenderHook } from '@testing-library/react-hooks'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import { NextRouter } from 'next/router'
import React from 'react'
import { BlitzProvider, queryClient } from 'next/data-client'

export * from '@testing-library/react'

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
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
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
  { wrapper, router, dehydratedState, ...options }: RenderOptions = {}
) {
  if (!wrapper) {
    wrapper = ({ children }) => (
      <BlitzProvider client={queryClient} dehydratedState={dehydratedState}>
        <RouterContext.Provider value={{ ...mockRouter, ...router }}>
          {children}
        </RouterContext.Provider>
      </BlitzProvider>
    )
  }

  return defaultRender(ui, { wrapper, ...options })
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
  { wrapper, router, dehydratedState, ...options }: RenderHookOptions = {}
) {
  if (!wrapper) {
    wrapper = ({ children }) => (
      <BlitzProvider client={queryClient} dehydratedState={dehydratedState}>
        <RouterContext.Provider value={{ ...mockRouter, ...router }}>
          {children}
        </RouterContext.Provider>
      </BlitzProvider>
    )
  }

  return defaultRenderHook(hook, { wrapper, ...options })
}

// This enhance fn does what buildRpcFunction does during build time
export function buildQueryRpc(fn: any) {
  const newFn = (...args: any) => {
    const [data, ...rest] = args
    return fn(data, ...rest)
  }
  newFn._isRpcClient = true
  newFn._resolverType = 'query'
  newFn._routePath = '/api/test/url/' + Math.random()
  return newFn
}

// This enhance fn does what buildRpcFunction does during build time
export function buildMutationRpc(fn: any) {
  const newFn = (...args: any) => fn(...args)
  newFn._isRpcClient = true
  newFn._resolverType = 'mutation'
  newFn._routePath = '/api/test/url'
  return newFn
}
