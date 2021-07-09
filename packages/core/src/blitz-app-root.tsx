import {getPublicDataStore, useAuthorizeIf, useSession} from "next/data-client"
import {formatWithValidation} from "next/dist/next-server/lib/utils"
import {RedirectError} from "next/stdlib"
import React, {ComponentPropsWithoutRef, useEffect} from "react"
import SuperJSON from "superjson"
import {BlitzProvider} from "./blitz-provider"
import {Head} from "./head"
import {AppProps, BlitzPage} from "./types"
import {clientDebug} from "./utils"

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
      <style dangerouslySetInnerHTML={{__html: customCSS}} />
      <noscript>
        <style dangerouslySetInnerHTML={{__html: noscriptCSS}} />
      </noscript>
    </Head>
  )
}

export function withBlitzInnerWrapper(Page: BlitzPage) {
  const BlitzInnerRoot = (props: ComponentPropsWithoutRef<BlitzPage>) => {
    // We call useSession so this will rerender anytime session changes
    useSession({suspense: false})

    useAuthorizeIf(Page.authenticate === true)

    if (typeof window !== "undefined") {
      // We read directly from publicDataStor.getData().userId instead of useSession
      // so we can access userId on first render. useSession is always empty on first render
      if (getPublicDataStore().getData().userId) {
        clientDebug("[BlitzInnerRoot] logged in")
        let {redirectAuthenticatedTo} = Page
        if (redirectAuthenticatedTo) {
          if (typeof redirectAuthenticatedTo !== "string") {
            redirectAuthenticatedTo = formatWithValidation(redirectAuthenticatedTo)
          }

          clientDebug("[BlitzInnerRoot] redirecting to", redirectAuthenticatedTo)
          const error = new RedirectError(redirectAuthenticatedTo)
          error.stack = null!
          throw error
        }
      } else {
        clientDebug("[BlitzInnerRoot] logged out")
        const authenticate = Page.authenticate
        if (authenticate && typeof authenticate === "object" && authenticate.redirectTo) {
          let {redirectTo} = authenticate
          if (typeof redirectTo !== "string") {
            redirectTo = formatWithValidation(redirectTo)
          }

          const url = new URL(redirectTo, window.location.href)
          url.searchParams.append("next", window.location.pathname)
          clientDebug("[BlitzInnerRoot] redirecting to", url.toString())
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
  if (process.env.NODE_ENV !== "production") {
    BlitzInnerRoot.displayName = `BlitzInnerRoot`
  }
  return BlitzInnerRoot
}

export function withBlitzAppRoot(UserAppRoot: React.ComponentType<any>) {
  const BlitzOuterRoot = (props: AppProps) => {
    const component = React.useMemo(() => withBlitzInnerWrapper(props.Component), [props.Component])

    const noPageFlicker =
      props.Component.suppressFirstRenderFlicker ||
      props.Component.authenticate !== undefined ||
      props.Component.redirectAuthenticatedTo

    useEffect(() => {
      document.documentElement.classList.add("blitz-first-render-complete")
    }, [])

    const dehydratedState = props.pageProps.dehydratedState
      ? SuperJSON.deserialize(props.pageProps.dehydratedState)
      : undefined

    return (
      <BlitzProvider dehydratedState={dehydratedState}>
        {noPageFlicker && <NoPageFlicker />}
        <UserAppRoot {...props} Component={component} />
      </BlitzProvider>
    )
  }
  return BlitzOuterRoot
}
