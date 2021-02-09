import React from "react"
import {AppProps} from "."
import {SessionContextProvider} from "./supertokens"

export function withBlitzAppRoot(WrappedComponent: React.ComponentType<any>) {
  const BlitzAppRoot = (props: AppProps) => {
    // props comes afterwards so the can override the default ones.
    return (
      <SessionContextProvider>
        <WrappedComponent {...(props as any)} />
      </SessionContextProvider>
    )
  }

  BlitzAppRoot.displayName = `BlitzAppRoot`

  return BlitzAppRoot
}
