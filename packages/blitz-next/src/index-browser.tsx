import "./global"
import type {ClientPlugin, BlitzPluginWithProvider} from "blitz"
import {reduceBlitzPlugins, Ctx} from "blitz"
import Head from "next/head"
import React, {ReactNode} from "react"
import {QueryClient, QueryClientProvider, Hydrate, HydrateOptions} from "@tanstack/react-query"
import {withSuperJSONPage} from "./superjson"
import {UrlObject} from "url"
import {AppPropsType} from "next/dist/shared/lib/utils"
import {Router, useRouter} from "next/router"
import {RouterContext} from "./router-context"

export * from "./error-boundary"
export * from "./error-component"
export * from "./use-params"
export * from "./router-context"
export {Routes} from ".blitz"

const buildWithBlitz = (withPlugins: BlitzPluginWithProvider) => {
  return function withBlitzAppRoot(UserAppRoot: React.ComponentType<AppProps>) {
    const BlitzOuterRoot = (props: AppProps) => {
      const component = React.useMemo(() => withPlugins(props.Component), [props.Component])

      React.useEffect(() => {
        // supress first render flicker
        setTimeout(() => {
          document.documentElement.classList.add("blitz-first-render-complete")
        })
      }, [])

      return (
        <BlitzProvider dehydratedState={props.pageProps?.dehydratedState}>
          <>
            {props.Component.suppressFirstRenderFlicker && <NoPageFlicker />}
            <UserAppRoot {...props} Component={component} />
          </>
        </BlitzProvider>
      )
    }

    Object.assign(BlitzOuterRoot, UserAppRoot)
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

interface RouteUrlObject extends Pick<UrlObject, "pathname" | "query" | "href"> {
  pathname: string
}

type RedirectAuthenticatedTo = string | RouteUrlObject | false
type RedirectAuthenticatedToFnCtx = {
  session: Ctx["session"]["$publicData"]
}
type RedirectAuthenticatedToFn = (args: RedirectAuthenticatedToFnCtx) => RedirectAuthenticatedTo
export type BlitzPage<P = {}> = React.ComponentType<P> & {
  getLayout?: (component: JSX.Element) => JSX.Element
  authenticate?: boolean | {redirectTo?: string | RouteUrlObject; role?: string | Array<string>}
  suppressFirstRenderFlicker?: boolean
  redirectAuthenticatedTo?: RedirectAuthenticatedTo | RedirectAuthenticatedToFn
}
export type BlitzLayout<P = {}> = React.ComponentType<P & {children: ReactNode}> & {
  authenticate?: boolean | {redirectTo?: string | RouteUrlObject}
  redirectAuthenticatedTo?: RedirectAuthenticatedTo | RedirectAuthenticatedToFn
}
export type AppProps<P = {}> = AppPropsType<Router, P> & {
  Component: BlitzPage
}
export const BlitzProvider = ({
  client = globalThis.queryClient,
  contextSharing = false,
  dehydratedState,
  hydrateOptions,
  children,
}: BlitzProviderProps) => {
  const router = useRouter()

  if (client) {
    return (
      <RouterContext.Provider value={router}>
        <QueryClientProvider
          client={client || globalThis.queryClient}
          contextSharing={contextSharing}
        >
          <Hydrate state={dehydratedState} options={hydrateOptions}>
            {children}
          </Hydrate>
        </QueryClientProvider>
      </RouterContext.Provider>
    )
  }

  return <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
}

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

  const {exports, withPlugins} = reduceBlitzPlugins({plugins})

  const withBlitz = buildWithBlitz(withPlugins)

  // todo: finish this
  // Used to build BlitzPage type
  // const types = {} as {plugins: typeof plugins}

  return {
    withBlitz,
    ...exports,
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
