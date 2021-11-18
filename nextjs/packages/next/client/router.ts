/* global window */
import React from 'react'
import Router, {
  extractQueryFromAsPath,
  extractRouterParams,
} from '../shared/lib/router/router'
import type { NextRouter } from '../shared/lib/router/router'
import { RouterContext } from '../shared/lib/router-context'

type ClassArguments<T> = T extends new (...args: infer U) => any ? U : any

type RouterArgs = ClassArguments<typeof Router>

type SingletonRouterBase = {
  router: Router | null
  readyCallbacks: Array<() => any>
  ready(cb: () => any): void
}

export { Router }

export type { NextRouter }
export type BlitzRouter = NextRouter

export type SingletonRouter = SingletonRouterBase & NextRouter

const singletonRouter: SingletonRouterBase = {
  router: null, // holds the actual router instance
  readyCallbacks: [],
  ready(cb: () => void) {
    if (this.router) return cb()
    if (typeof window !== 'undefined') {
      this.readyCallbacks.push(cb)
    }
  },
}

// Create public properties and methods of the router in the singletonRouter
const urlPropertyFields = [
  'pathname',
  'route',
  'query',
  'asPath',
  'components',
  'isFallback',
  'basePath',
  'locale',
  'locales',
  'defaultLocale',
  'isReady',
  'isPreview',
  'isLocaleDomain',
  'domainLocales',
]
const routerEvents = [
  'routeChangeStart',
  'beforeHistoryChange',
  'routeChangeComplete',
  'routeChangeError',
  'hashChangeStart',
  'hashChangeComplete',
] as const
export type RouterEvent = typeof routerEvents[number]

const coreMethodFields = [
  'push',
  'replace',
  'reload',
  'back',
  'prefetch',
  'beforePopState',
]

// Events is a static property on the router, the router doesn't have to be initialized to use it
Object.defineProperty(singletonRouter, 'events', {
  get() {
    return Router.events
  },
})

urlPropertyFields.forEach((field: string) => {
  // Here we need to use Object.defineProperty because we need to return
  // the property assigned to the actual router
  // The value might get changed as we change routes and this is the
  // proper way to access it
  Object.defineProperty(singletonRouter, field, {
    get() {
      const router = getRouter() as any
      return router[field] as string
    },
  })
})

coreMethodFields.forEach((field: string) => {
  // We don't really know the types here, so we add them later instead
  ;(singletonRouter as any)[field] = (...args: any[]) => {
    const router = getRouter() as any
    return router[field](...args)
  }
})

routerEvents.forEach((event) => {
  singletonRouter.ready(() => {
    Router.events.on(event, (...args) => {
      const eventField = `on${event.charAt(0).toUpperCase()}${event.substring(
        1
      )}`
      const _singletonRouter = singletonRouter as any
      if (_singletonRouter[eventField]) {
        try {
          _singletonRouter[eventField](...args)
        } catch (err) {
          console.error(`Error when running the Router event: ${eventField}`)
          console.error(`${err.message}\n${err.stack}`)
        }
      }
    })
  })
})

function getRouter(): Router {
  if (!singletonRouter.router) {
    const message =
      'No router instance found.\n' +
      'You should only use "next/router" on the client side of your app.\n'
    throw new Error(message)
  }
  return singletonRouter.router
}

// Export the singletonRouter and this is the public API.
export default singletonRouter as SingletonRouter

// Reexport the withRoute HOC
export { default as withRouter } from './with-router'

/**
 * `useRouter` is a React hook used to access `router` object within components
 *
 * @returns `router` object
 * @see Docs {@link https://blitzjs.com/docs/router#router-object | router}
 */
export function useRouter(): NextRouter {
  return React.useContext(RouterContext)
}

// INTERNAL APIS
// -------------
// (do not use following exports inside the app)

// Create a router and assign it as the singleton instance.
// This is used in client side when we are initilizing the app.
// This should **not** be used inside the server.
export function createRouter(...args: RouterArgs): Router {
  singletonRouter.router = new Router(...args)
  singletonRouter.readyCallbacks.forEach((cb) => cb())
  singletonRouter.readyCallbacks = []

  return singletonRouter.router
}

// This function is used to create the `withRouter` router instance
export function makePublicRouterInstance(router: Router): NextRouter {
  const _router = router as any
  const instance = {} as any

  for (const property of urlPropertyFields) {
    if (typeof _router[property] === 'object') {
      instance[property] = Object.assign(
        Array.isArray(_router[property]) ? [] : {},
        _router[property]
      ) // makes sure query is not stateful
      continue
    }

    instance[property] = _router[property]
  }

  // Events is a static property on the router, the router doesn't have to be initialized to use it
  instance.events = Router.events

  coreMethodFields.forEach((field) => {
    instance[field] = (...args: any[]) => {
      return _router[field](...args)
    }
  })

  return instance
}

export function useRouterQuery() {
  const router = useRouter()

  const query = React.useMemo(() => extractQueryFromAsPath(router.asPath), [
    router.asPath,
  ])

  return query
}

type Dict<T> = Record<string, T | undefined>
type ReturnTypes = 'string' | 'number' | 'array'

export function useParams(): Dict<string | string[]>
export function useParams(returnType?: ReturnTypes): Dict<string | string[]>
export function useParams(returnType: 'string'): Dict<string>
export function useParams(returnType: 'number'): Dict<number>
export function useParams(returnType: 'array'): Dict<string[]>

export function useParams(
  returnType?: 'string' | 'number' | 'array' | undefined
) {
  const router = useRouter()
  const query = useRouterQuery()

  const params = React.useMemo(() => {
    const rawParams = extractRouterParams(router.query, query)

    if (returnType === 'string') {
      const parsedParams: Dict<string> = {}
      for (const key in rawParams) {
        if (typeof rawParams[key] === 'string') {
          parsedParams[key] = rawParams[key] as string
        }
      }
      return parsedParams
    }

    if (returnType === 'number') {
      const parsedParams: Dict<number> = {}
      for (const key in rawParams) {
        if (rawParams[key]) {
          const num = Number(rawParams[key])
          parsedParams[key] = isNaN(num) ? undefined : num
        }
      }
      return parsedParams
    }

    if (returnType === 'array') {
      const parsedParams: Dict<string[]> = {}
      for (const key in rawParams) {
        const rawValue = rawParams[key]
        if (Array.isArray(rawParams[key])) {
          parsedParams[key] = rawValue as string[]
        } else if (typeof rawValue === 'string') {
          parsedParams[key] = [rawValue]
        }
      }
      return parsedParams
    }

    return rawParams
  }, [router.query, query, returnType])

  return params
}

export function useParam(key: string): undefined | string | string[]
export function useParam(key: string, returnType: 'string'): string | undefined
export function useParam(key: string, returnType: 'number'): number | undefined
export function useParam(key: string, returnType: 'array'): string[] | undefined
export function useParam(
  key: string,
  returnType?: ReturnTypes
): undefined | number | string | string[] {
  const params = useParams(returnType)
  const value = params[key]

  return value
}
