import React, {FC} from "react"
import {QueryClientProvider, QueryClientProviderProps} from "react-query"
import {Hydrate} from "react-query/hydration"
import {queryClient} from "./utils/react-query-utils"

export type BlitzProviderProps = Omit<QueryClientProviderProps, "client"> & {
  dehydratedState?: unknown
}

export const BlitzProvider: FC<BlitzProviderProps> = ({
  contextSharing = false,
  dehydratedState,
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient} contextSharing={contextSharing}>
      {dehydratedState ? <Hydrate state={dehydratedState}>{children}</Hydrate> : children}
    </QueryClientProvider>
  )
}
