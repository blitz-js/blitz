import {QueryClientProvider, HydrationBoundary} from "@blitzjs/rpc"
import type {QueryClient, HydrateOptions} from "@blitzjs/rpc"
import React from "react"

export type BlitzProviderProps = {
  children: React.JSX.Element
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
        <HydrationBoundary state={dehydratedState} options={hydrateOptions}>
          {children}
        </HydrationBoundary>
      </QueryClientProvider>
    )
  }

  return children
}
