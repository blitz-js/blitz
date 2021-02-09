import React from "react"
import {AppProps} from "."

export function withBlitzAppRoot(WrappedComponent: React.ComponentType<any>) {
  const BlitzAppRoot = (props: AppProps) => {
    // props comes afterwards so the can override the default ones.
    return <WrappedComponent {...(props as any)} />
  }
  BlitzAppRoot.displayName = `BlitzAppRoot`
  return BlitzAppRoot
}
