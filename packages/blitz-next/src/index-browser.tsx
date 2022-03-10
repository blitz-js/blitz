import {ClientPlugin} from "blitz"
import {AppProps} from "next/app"
import Head from "next/head"
import React, {FC} from "react"
import {Hydrate, HydrateOptions, QueryClient, QueryClientProvider} from "react-query"
import {UrlObject} from "url"

import type {NextApiRequest, NextApiResponse} from "next"
export type {NextApiRequest, NextApiResponse}

// todo: where the following should go?
export interface MiddlewareRequest extends NextApiRequest {
  protocol?: string
}
export type MiddlewareNext = (error?: Error) => Promise<void> | void
export interface MiddlewareResponse<C> extends NextApiResponse {
  /**
   * This will be passed as the second argument to Blitz queries/mutations.
   *
   * You must set blitzCtx BEFORE calling next()
   */
  blitzCtx: C
  /**
   * This is the exact result returned from the Blitz query/mutation
   *
   * You must first `await next()` before reading this
   */
  blitzResult: unknown
}

export type Middleware<C = any> = {
  (req: MiddlewareRequest, res: MiddlewareResponse<C>, next: MiddlewareNext): Promise<void> | void
  type?: string
  config?: Record<any, any>
}

export interface RouteUrlObject extends Pick<UrlObject, "pathname" | "query"> {
  pathname: string
}

type BlitzHoc = (component: React.ComponentType<any>) => React.ComponentType<any>

const compose =
  (...rest: BlitzHoc[]) =>
  (x: React.ComponentType<any>) =>
    rest.reduceRight((y, f) => f(y), x)

const buildWithBlitz = <TPlugins extends readonly ClientPlugin<object>[]>(plugins: TPlugins) => {
  const providers = plugins.reduce((acc, plugin) => {
    return plugin.withProvider ? acc.concat(plugin.withProvider) : acc
  }, [] as BlitzHoc[])
  const withPlugins = compose(...providers)

  return function withBlitzAppRoot(UserAppRoot: React.ComponentType<any>) {
    const BlitzOuterRoot = (props: AppProps) => {
      const component = React.useMemo(() => withPlugins(props.Component), [props.Component])

      // supress first render flicker
      React.useEffect(() => {
        setTimeout(() => {
          document.documentElement.classList.add("blitz-first-render-complete")
        })
      }, [])

      return (
        <BlitzProvider dehydratedState={props.pageProps?.dehydratedState}>
          {/* @ts-ignore todo */}
          {props.Component.suppressFirstRenderFlicker && <NoPageFlicker />}
          <UserAppRoot {...props} Component={component} />
        </BlitzProvider>
      )
    }
    return BlitzOuterRoot
  }
}

export type BlitzProviderProps = {
  client?: QueryClient
  contextSharing?: boolean
  dehydratedState?: unknown
  hydrateOptions?: HydrateOptions
}

const BlitzProvider: FC<BlitzProviderProps> = ({
  client,
  contextSharing = false,
  dehydratedState,
  hydrateOptions,
  children,
}) => {
  return (
    <QueryClientProvider client={client || queryClient} contextSharing={contextSharing}>
      <Hydrate state={dehydratedState} options={hydrateOptions}>
        {children}
      </Hydrate>
    </QueryClientProvider>
  )
}

// todo: move to ts utils
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

type Simplify<T> = {[P in keyof T]: T[P]}

export type PluginsExports<TPlugins extends readonly ClientPlugin<object>[]> = Simplify<
  UnionToIntersection<
    {
      [I in keyof TPlugins & number]: ReturnType<TPlugins[I]["exports"]>
    }[number]
  >
>

const setupClient = <TPlugins extends readonly ClientPlugin<object>[]>({
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

export {setupClient}

// ------------------------------------ QUERY CLIENT CODE --------------------------------------------

const initializeQueryClient = () => {
  let suspenseEnabled = true
  if (!process.env.CLI_COMMAND_CONSOLE && !process.env.CLI_COMMAND_DB) {
    suspenseEnabled = Boolean(process.env.__BLITZ_SUSPENSE_ENABLED)
  }

  return new QueryClient({
    defaultOptions: {
      queries: {
        ...(typeof window === "undefined" && {cacheTime: 0}),
        suspense: suspenseEnabled,
        retry: (failureCount, error: any) => {
          if (process.env.NODE_ENV !== "production") return false

          // Retry (max. 3 times) only if network error detected
          if (error.message === "Network request failed" && failureCount <= 3) return true

          return false
        },
      },
    },
  })
}

const queryClient = initializeQueryClient()

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
