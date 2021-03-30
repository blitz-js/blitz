import React, {useEffect} from "react"
import {useAuthorizeIf} from "./auth/auth-client"
import {publicDataStore} from "./auth/public-data-store"
import {Head} from "./head"
import {AppProps} from "./types"

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

function AuthGuard({Component, ...rest}: any) {
  useAuthorizeIf(Component.authenticate === true)
  for (let [key, value] of Object.entries(rest)) {
    ;(Component as any)[key] = value
  }
  if (process.env.NODE_ENV !== "production") {
    Component.displayName = `BlitzInnerRoot`
  }
  return Component
}

export function withBlitzAppRoot(UserAppRoot: React.ComponentType<any>) {
  const BlitzOuterRoot = (props: AppProps) => {
    if (typeof window !== "undefined") {
      if (publicDataStore.getData().userId) {
        if (props.Component.redirectAuthenticatedTo) {
          window.location.replace(props.Component.redirectAuthenticatedTo)
        }
      } else {
        const authenticate = props.Component.authenticate
        if (
          authenticate &&
          typeof authenticate === "object" &&
          typeof authenticate.redirectTo === "string"
        ) {
          const url = new URL(authenticate.redirectTo, window.location.href)
          url.searchParams.append("next", window.location.pathname)
          window.location.replace(url.toString())
        }
      }
    }

    const noPageFlicker =
      props.Component.suppressFirstRenderFlicker ||
      props.Component.authenticate !== undefined ||
      props.Component.redirectAuthenticatedTo

    useEffect(() => {
      document.documentElement.classList.add("blitz-first-render-complete")
    }, [])

    return (
      <>
        {noPageFlicker && <NoPageFlicker />}
        <UserAppRoot {...props} Component={AuthGuard(props)} />
      </>
    )
  }
  if (process.env.NODE_ENV !== "production") {
    BlitzOuterRoot.displayName = `BlitzOuterRoot`
  }
  return BlitzOuterRoot
}
