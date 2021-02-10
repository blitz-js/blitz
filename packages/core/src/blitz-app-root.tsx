import React, {useEffect} from "react"
import {AppProps, Head} from "."

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

export function withBlitzAppRoot(WrappedComponent: React.ComponentType<any>) {
  const BlitzAppRoot = (props: AppProps) => {
    useEffect(() => {
      document.documentElement.classList.add("blitz-first-render-complete")
    }, [])

    return (
      <>
        <Head>
          <style dangerouslySetInnerHTML={{__html: customCSS}} />
          <noscript>
            <style dangerouslySetInnerHTML={{__html: noscriptCSS}} />
          </noscript>
        </Head>
        <WrappedComponent {...(props as any)} />
      </>
    )
  }
  BlitzAppRoot.displayName = `BlitzAppRoot`
  return BlitzAppRoot
}
