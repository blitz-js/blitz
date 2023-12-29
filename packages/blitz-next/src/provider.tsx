import {QueryClientProvider, Hydrate} from "@blitzjs/rpc"
import type {QueryClient, HydrateOptions} from "@blitzjs/rpc"
import React from "react"

export type BlitzProviderProps = {
  children: JSX.Element
  client?: QueryClient
  contextSharing?: boolean
  dehydratedState?: unknown
  hydrateOptions?: HydrateOptions
}

export const BlitzProvider = ({
  client = globalThis.queryClient,
  dehydratedState,
  hydrateOptions,
  children,
}: BlitzProviderProps) => {
  if (client) {
    return (
      <QueryClientProvider client={client || globalThis.queryClient}>
        <Hydrate state={dehydratedState} options={hydrateOptions}>
          {children}
        </Hydrate>
      </QueryClientProvider>
    )
  }

  return children
}
