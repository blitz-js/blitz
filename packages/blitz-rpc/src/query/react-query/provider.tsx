"use client"
import {QueryClientProvider} from "@tanstack/react-query"
import React from "react"

globalThis.__BLITZ_RSC = true

export default function Providers({children}) {
  const [queryClient] = React.useState(globalThis.queryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
