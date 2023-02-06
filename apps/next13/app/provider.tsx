"use client"

import {QueryClientProvider} from "@tanstack/react-query"
import {queryClient as BlitzQueryClient} from "../src/blitz-client"
import React from "react"

globalThis.__BLITZ_RSC = true

export default function Providers({children}) {
  const [queryClient] = React.useState(BlitzQueryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
