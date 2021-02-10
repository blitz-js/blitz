import React, {useEffect} from "react"
import {AppProps, BlitzPage, Head} from "."
import {publicDataStore} from "./public-data-store"
import {useAuthorizeIf} from "./supertokens"

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

export function withBlitzInnerWrapper(WrappedComponent: React.ComponentType<any>) {
  const BlitzInnerRoot = (props: AppProps) => {
    useAuthorizeIf((WrappedComponent as BlitzPage).authenticate)

    return <WrappedComponent {...props} />
  }
  BlitzInnerRoot.displayName = `BlitzInnerRoot`
  return BlitzInnerRoot
}

export function withBlitzAppRoot(WrappedComponent: React.ComponentType<any>) {
  const BlitzOuterRoot = (props: AppProps) => {
    if (
      props.Component.redirectAuthenticatedTo &&
      publicDataStore.getData().userId &&
      typeof window !== "undefined"
    ) {
      window.location.replace(props.Component.redirectAuthenticatedTo)
    }

    const noPageFlicker =
      props.Component.supressFirstRenderFlicker ||
      props.Component.authenticate !== undefined ||
      props.Component.redirectAuthenticatedTo

    useEffect(() => {
      document.documentElement.classList.add("blitz-first-render-complete")
    }, [])

    return (
      <>
        {noPageFlicker && <NoPageFlicker />}
        <WrappedComponent {...props} Component={withBlitzInnerWrapper(props.Component)} />
      </>
    )
  }
  BlitzOuterRoot.displayName = `BlitzOuterRoot`
  return BlitzOuterRoot
}
