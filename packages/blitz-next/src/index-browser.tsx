import "./global"
import type {ClientPlugin, BlitzPluginWithProvider} from "blitz"
import {reduceBlitzClientPlugins, Ctx} from "blitz"
import React, {ReactNode} from "react"
import {withSuperJSONPage} from "./superjson"
import {UrlObject} from "url"
import {AppPropsType} from "next/dist/shared/lib/utils"
import type {Router} from "next/router"
import {BlitzProvider} from "./provider"
import dynamic from "next/dynamic"
export {Routes} from ".blitz"
const Head = dynamic(() => import("next/head").then((mod) => mod.default), {
  ssr: false,
  loading: () => null,
})

export {BlitzProvider} from "./provider"

const buildWithBlitz = (withPlugins: BlitzPluginWithProvider) => {
  return function withBlitzAppRoot(UserAppRoot: React.ComponentType<AppProps>) {
    const BlitzOuterRoot = (props: AppProps<{dehydratedState: unknown}>) => {
      const component = React.useMemo(() => withPlugins(props.Component), [props.Component])

      React.useEffect(() => {
        // supress first render flicker
        setTimeout(() => {
          document.documentElement.classList.add("blitz-first-render-complete")
        })
      }, [])

      const children = (
        <>
          {props.Component.suppressFirstRenderFlicker && <NoPageFlicker />}
          <UserAppRoot {...props} Component={component} />
        </>
      )

      return (
        <BlitzProvider dehydratedState={props.pageProps?.dehydratedState}>{children}</BlitzProvider>
      )
    }

    Object.assign(BlitzOuterRoot, UserAppRoot)
    return withSuperJSONPage(BlitzOuterRoot)
  }
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

const setupBlitzClient = <TPlugins extends readonly ClientPlugin<object>[]>({
  plugins,
}: {
  plugins: TPlugins
}) => {
  const {exports, withPlugins} = reduceBlitzClientPlugins({plugins})

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

export * from "./error-boundary"
export * from "./error-component"
export * from "./use-params"
export * from "./router-context"
