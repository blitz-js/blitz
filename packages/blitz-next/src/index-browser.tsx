import "./global"
import type {
  ClientPlugin,
  BlitzProvider as BlitzProviderType,
  UnionToIntersection,
  Simplify,
} from "blitz"
import Head from "next/head"
import React from "react"
import {QueryClient, QueryClientProvider} from "react-query"
import {Hydrate, HydrateOptions} from "react-query/hydration"
import {withSuperJSONPage} from "./superjson"
import {Ctx} from "blitz"
import {UrlObject} from "url"
import {AppPropsType} from "next/dist/shared/lib/utils"
import {Router} from "next/router"

export * from "./error-boundary"
export * from "./error-component"
export * from "./use-params"
export {Routes} from ".blitz"

const compose =
  (...rest: BlitzProviderType[]) =>
  (x: React.ComponentType<any>) =>
    rest.reduceRight((y, f) => f(y), x)

const buildWithBlitz = <TPlugins extends readonly ClientPlugin<object>[]>(plugins: TPlugins) => {
  const providers = plugins.reduce((acc, plugin) => {
    return plugin.withProvider ? acc.concat(plugin.withProvider) : acc
  }, [] as BlitzProviderType[])
  const withPlugins = compose(...providers)

  return function withBlitzAppRoot(UserAppRoot: React.ComponentType<any>) {
    const BlitzOuterRoot = (props: AppProps) => {
      const component = React.useMemo(() => withPlugins(props.Component), [props.Component])

      const [mounted, setMounted] = React.useState(false)

      React.useEffect(() => {
        // Current workaround to fix react 18 suspense error issue
        setMounted(true)
        // supress first render flicker
        setTimeout(() => {
          document.documentElement.classList.add("blitz-first-render-complete")
        })
      }, [])

      return (
        <BlitzProvider dehydratedState={props.pageProps?.dehydratedState}>
          <>
            {/* @ts-ignore todo */}
            {props.Component.suppressFirstRenderFlicker && <NoPageFlicker />}
            {mounted && <UserAppRoot {...props} Component={component} />}
          </>
        </BlitzProvider>
      )
    }
    return withSuperJSONPage(BlitzOuterRoot)
  }
}

export type BlitzProviderProps = {
  children: JSX.Element
  client?: QueryClient
  contextSharing?: boolean
  dehydratedState?: unknown
  hydrateOptions?: HydrateOptions
}

interface RouteUrlObject extends Pick<UrlObject, "pathname" | "query"> {
  pathname: string
}
type RedirectAuthenticatedTo = string | RouteUrlObject | false
type RedirectAuthenticatedToFnCtx = {
  session: Ctx["session"]["$publicData"]
}
type RedirectAuthenticatedToFn = (args: RedirectAuthenticatedToFnCtx) => RedirectAuthenticatedTo
export type BlitzPage<P = {}> = React.ComponentType<P> & {
  getLayout?: (component: JSX.Element) => JSX.Element
  authenticate?: boolean | {redirectTo?: string | RouteUrlObject}
  suppressFirstRenderFlicker?: boolean
  redirectAuthenticatedTo?: RedirectAuthenticatedTo | RedirectAuthenticatedToFn
}
export type BlitzLayout<P = {}> = React.ComponentType<P> & {
  authenticate?: boolean | {redirectTo?: string | RouteUrlObject}
  redirectAuthenticatedTo?: RedirectAuthenticatedTo | RedirectAuthenticatedToFn
}
export type AppProps<P = {}> = AppPropsType<Router, P> & {
  Component: BlitzPage
}
const BlitzProvider = ({
  client,
  contextSharing = false,
  dehydratedState,
  hydrateOptions,
  children,
}: BlitzProviderProps) => {
  if (globalThis.queryClient) {
    return (
      <QueryClientProvider
        client={client || globalThis.queryClient}
        contextSharing={contextSharing}
      >
        <Hydrate state={dehydratedState} options={hydrateOptions}>
          {children}
        </Hydrate>
      </QueryClientProvider>
    )
  }

  return children
}

export type PluginsExports<TPlugins extends readonly ClientPlugin<object>[]> = Simplify<
  UnionToIntersection<
    {
      [I in keyof TPlugins & number]: ReturnType<TPlugins[I]["exports"]>
    }[number]
  >
>

const setupBlitzClient = <TPlugins extends readonly ClientPlugin<object>[]>({
  plugins,
}: {
  plugins: TPlugins
}) => {
  // merge middlewares to single functions
  // merge events
  // register exports

  // const allMiddleware = []
  // const clientCtx = {
  //   middleware: allMiddleware
  // }
  // for (let plugin of plugins) {
  //   const { middleware } = plugin(clientCtx)
  //   allMiddleware.push(middleware)
  // }

  const exports = plugins.reduce((acc, plugin) => ({...plugin.exports(), ...acc}), {})

  const withBlitz = buildWithBlitz(plugins)

  // todo: finish this
  // Used to build BlitzPage type
  const types = {} as {plugins: typeof plugins}

  return {
    types,
    withBlitz,
    ...(exports as PluginsExports<TPlugins>),
  }
}

export {setupBlitzClient}

const customCSS = `
  body::before {
    content: "";
    display: block;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 99999;
    background-color: white;
  }

  .blitz-first-render-complete body::before {
    display: none;
  }
`
const noscriptCSS = `
  body::before {
    content: none
  }
`

export const NoPageFlicker = () => {
  return (
    <Head>
      <style dangerouslySetInnerHTML={{__html: customCSS}} />
      <noscript>
        <style dangerouslySetInnerHTML={{__html: noscriptCSS}} />
      </noscript>
    </Head>
  )
}
