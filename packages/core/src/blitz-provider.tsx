import React, {FC, useRef} from "react"
import {QueryClient, QueryClientProvider} from "react-query"
import {Hydrate} from "react-query/hydration"
import {queryClient} from "./utils/react-query-utils"

export type BlitzProviderProps = {
  client?: QueryClient
  contextSharing?: boolean
  dehydratedState?: unknown
}

export const BlitzProvider: FC<BlitzProviderProps> = ({
  client,
  contextSharing = false,
  dehydratedState,
  children,
}) => {
  const queryClientRef = useRef<QueryClient>()
  if (!queryClientRef.current) {
    queryClientRef.current = queryClient
  }

  return (
    <QueryClientProvider client={client ?? queryClient} contextSharing={contextSharing}>
      {dehydratedState ? <Hydrate state={dehydratedState}>{children}</Hydrate> : children}
    </QueryClientProvider>
  )
}
