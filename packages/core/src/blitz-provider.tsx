import React, {FC, useRef} from "react"
import {QueryClient, QueryClientProvider} from "react-query"
import {Hydrate, HydrateOptions} from "react-query/hydration"
import {queryClient} from "./utils/react-query-utils"

export type BlitzProviderProps = {
  client?: QueryClient
  contextSharing?: boolean
  dehydratedState?: unknown
  hydrateOptions?: HydrateOptions
}

export const BlitzProvider: FC<BlitzProviderProps> = ({
  client,
  contextSharing = false,
  dehydratedState,
  hydrateOptions,
  children,
}) => {
  const queryClientRef = useRef<QueryClient>()
  if (!queryClientRef.current) {
    queryClientRef.current = queryClient
  }

  return (
    <QueryClientProvider client={client ?? queryClient} contextSharing={contextSharing}>
      <Hydrate state={dehydratedState} options={hydrateOptions}>
        {children}
      </Hydrate>
    </QueryClientProvider>
  )
}
