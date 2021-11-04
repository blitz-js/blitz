import {
  getPublicDataStore,
  useAuthorizeIf,
  useSession,
} from '../data-client/auth'
import { formatWithValidation } from '../shared/lib/utils'
import { Head } from '../shared/lib/head'
import { RedirectError } from './errors'
import { AppProps, BlitzPage } from '../types/index'
import React, {
  ComponentPropsWithoutRef,
  ComponentType,
  useEffect,
  FC,
} from 'react'
import SuperJSON from 'superjson'
import { Hydrate, HydrateOptions } from 'react-query/hydration'
import { QueryClient, QueryClientProvider } from 'react-query'
import { queryClient } from '../data-client/react-query-utils'
const debug = require('debug')('blitz:approot')

export type BlitzProviderProps = {
  client?: QueryClient
  contextSharing?: boolean
  dehydratedState?: unknown
  hydrateOptions?: HydrateOptions
}

export const BlitzProvider: FC<BlitzProviderProps> = ({
  client,
  contextSharing = false,
  dehydratedState,
  hydrateOptions,
  children,
}) => {
  return (
    <QueryClientProvider
      client={client ?? queryClient}
      contextSharing={contextSharing}
    >
      <Hydrate state={dehydratedState} options={hydrateOptions}>
        {children}
      </Hydrate>
    </QueryClientProvider>
  )
}

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

const NoPageFlicker = () => {
  return (
    <Head>
      <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: noscriptCSS }} />
      </noscript>
    </Head>
  )
}

function getAuthValues(
  Page: BlitzPage,
  props: ComponentPropsWithoutRef<BlitzPage>
) {
  let authenticate = Page.authenticate
  let redirectAuthenticatedTo = Page.redirectAuthenticatedTo

  if (authenticate === undefined && redirectAuthenticatedTo === undefined) {
    const layout = Page.getLayout?.(<Page {...props} />)

    if (layout) {
      let currentElement = layout
      while (true) {
        const type = layout.type

        if (
          type.authenticate !== undefined ||
          type.redirectAuthenticatedTo !== undefined
        ) {
          authenticate = type.authenticate
          redirectAuthenticatedTo = type.redirectAuthenticatedTo
          break
        }

        if (currentElement.props.children) {
          currentElement = currentElement.props.children
        } else {
          break
        }
      }
    }
  }

  return { authenticate, redirectAuthenticatedTo }
}

function withBlitzInnerWrapper(Page: BlitzPage) {
  const BlitzInnerRoot = (props: ComponentPropsWithoutRef<BlitzPage>) => {
    // We call useSession so this will rerender anytime session changes
    useSession({ suspense: false })

    let { authenticate, redirectAuthenticatedTo } = getAuthValues(Page, props)

    useAuthorizeIf(authenticate === true)

    if (typeof window !== 'undefined') {
      const publicData = getPublicDataStore().getData()
      // We read directly from publicData.userId instead of useSession
      // so we can access userId on first render. useSession is always empty on first render
      if (publicData.userId) {
        debug('[BlitzInnerRoot] logged in')

        if (typeof redirectAuthenticatedTo === 'function') {
          redirectAuthenticatedTo = redirectAuthenticatedTo({
            session: publicData,
          })
        }

        if (redirectAuthenticatedTo) {
          const redirectUrl =
            typeof redirectAuthenticatedTo === 'string'
              ? redirectAuthenticatedTo
              : formatWithValidation(redirectAuthenticatedTo)

          debug('[BlitzInnerRoot] redirecting to', redirectUrl)
          const error = new RedirectError(redirectUrl)
          error.stack = null!
          throw error
        }
      } else {
        debug('[BlitzInnerRoot] logged out')
        if (
          authenticate &&
          typeof authenticate === 'object' &&
          authenticate.redirectTo
        ) {
          let { redirectTo } = authenticate
          if (typeof redirectTo !== 'string') {
            redirectTo = formatWithValidation(redirectTo)
          }

          const url = new URL(redirectTo, window.location.href)
          url.searchParams.append('next', window.location.pathname)
          debug('[BlitzInnerRoot] redirecting to', url.toString())
          const error = new RedirectError(url.toString())
          error.stack = null!
          throw error
        }
      }
    }

    return <Page {...props} />
  }
  for (let [key, value] of Object.entries(Page)) {
    ;(BlitzInnerRoot as any)[key] = value
  }
  if (process.env.NODE_ENV !== 'production') {
    BlitzInnerRoot.displayName = `BlitzInnerRoot`
  }
  return BlitzInnerRoot
}

export function withBlitzAppRoot(UserAppRoot: React.ComponentType<any>) {
  const BlitzOuterRoot = (props: AppProps) => {
    const component = React.useMemo(
      () => withBlitzInnerWrapper(props.Component),
      [props.Component]
    )

    const { authenticate, redirectAuthenticatedTo } = getAuthValues(
      props.Component,
      props.pageProps
    )

    const noPageFlicker =
      props.Component.suppressFirstRenderFlicker ||
      authenticate !== undefined ||
      redirectAuthenticatedTo

    useEffect(() => {
      setTimeout(() => {
        document.documentElement.classList.add('blitz-first-render-complete')
      })
    }, [])

    let { dehydratedState, _superjson } = props.pageProps
    if (dehydratedState && _superjson) {
      const deserializedProps = SuperJSON.deserialize({
        json: { dehydratedState },
        meta: _superjson,
      }) as { dehydratedState: any }
      dehydratedState = deserializedProps?.dehydratedState
    }

    return (
      <BlitzProvider dehydratedState={dehydratedState}>
        {noPageFlicker && <NoPageFlicker />}
        <UserAppRoot {...props} Component={component} />
      </BlitzProvider>
    )
  }
  return BlitzOuterRoot as ComponentType<{}>
}
