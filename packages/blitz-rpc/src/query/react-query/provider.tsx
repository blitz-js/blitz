"use client"
import {QueryClientProvider} from "@tanstack/react-query"
import React from "react"

export default function Providers({children}) {
  const [queryClient] = React.useState(globalThis.queryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
