import {QueryClientProvider} from "@tanstack/react-query"
import React from "react"

export type BlitzProviderType = ({children}: {children: React.ReactNode}) => JSX.Element

const BlitzProvider: BlitzProviderType = ({children}) => {
  const [queryClient] = React.useState(globalThis.queryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default BlitzProvider
