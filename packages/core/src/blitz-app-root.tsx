import {formatWithValidation} from "next/dist/next-server/lib/utils"
// import Router from "next/router"
import React, {ComponentPropsWithoutRef, useEffect} from "react"
import {useSession, useAuthorizeIf} from "./auth/auth-client"
import {publicDataStore} from "./auth/public-data-store"
import {BlitzProvider} from "./blitz-provider"
import {RedirectError} from "./errors"
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
    useAuthorizeIf(Page.authenticate === true)

    // We call useSession so this will rerender anytime session changes
    useSession({suspense: false})
    if (typeof window !== "undefined") {
      // We read directly from publicDataStore.getData().userId instead of useSession
      // so we can access userId on first render. useSession is always empty on first render
      if (publicDataStore.getData().userId) {
        clientDebug("[BlitzInnerRoot] logged in")
        let {redirectAuthenticatedTo} = Page
        if (redirectAuthenticatedTo) {
          if (typeof redirectAuthenticatedTo !== "string") {
            redirectAuthenticatedTo = formatWithValidation(redirectAuthenticatedTo)
          }
          // Router.push(redirectAuthenticatedTo)

          clientDebug("[BlitzInnerRoot] Calling window.location")
          //@ts-ignore
          window.location = redirectAuthenticatedTo
        }
      } else {
        clientDebug("[BlitzInnerRoot] logged out")
        const authenticate = Page.authenticate
        clientDebug("[BlitzInnerRoot] authenticate", authenticate)
        if (authenticate && typeof authenticate === "object" && authenticate.redirectTo) {
          let {redirectTo} = authenticate
          if (typeof redirectTo !== "string") {
            redirectTo = formatWithValidation(redirectTo)
          }

          const url = new URL(redirectTo, window.location.href)
          url.searchParams.append("next", window.location.pathname)
          // Router.push(url.toString())
          // clientDebug("[BlitzInnerRoot] Calling window.location")
          //@ts-ignore
          // window.location = url.toString()
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
    clientDebug("[BlitzOuterRoot] render")
    const component = React.useMemo(() => withBlitzInnerWrapper(props.Component), [props.Component])

    const noPageFlicker =
      props.Component.suppressFirstRenderFlicker ||
      props.Component.authenticate !== undefined ||
      props.Component.redirectAuthenticatedTo

    useEffect(() => {
      document.documentElement.classList.add("blitz-first-render-complete")
    }, [])

    // if (authError) return null

    return (
      <BlitzProvider dehydratedState={props.pageProps.dehydratedState}>
        {noPageFlicker && <NoPageFlicker />}
        <UserAppRoot {...props} Component={component} />
      </BlitzProvider>
    )
  }
  return BlitzOuterRoot
}
