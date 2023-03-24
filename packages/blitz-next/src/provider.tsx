import {QueryClientProvider, Hydrate} from "@blitzjs/rpc"
import type {HydrateOptions, QueryClient} from "@blitzjs/rpc"
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
  contextSharing = false,
  dehydratedState,
  hydrateOptions,
  children,
}: BlitzProviderProps) => {
  if (client) {
    return (
      <QueryClientProvider
        client={client || globalThis.queryClient}
        contextSharing={contextSharing}
      >
        <Hydrate state={dehydratedState} options={hydrateOptions}>
          {children}
        </Hydrate>
      </QueryClientProvider>
    )
  }

  return children
}
