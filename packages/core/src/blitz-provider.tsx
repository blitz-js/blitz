import React, {FC} from "react"
import {QueryClientProvider, QueryClientProviderProps} from "react-query"
import {Hydrate} from "react-query/hydration"

export type BlitzProviderProps = QueryClientProviderProps & {
  dehydratedState?: unknown
}

export const BlitzProvider: FC<BlitzProviderProps> = ({
  client,
  contextSharing = false,
  dehydratedState,
  children,
}) => {
  return (
    <QueryClientProvider client={client} contextSharing={contextSharing}>
      {dehydratedState ? <Hydrate state={dehydratedState}>{children}</Hydrate> : children}
    </QueryClientProvider>
  )
}
