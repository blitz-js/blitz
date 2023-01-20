"use client"

import {queryClient, RSC_BlitzProvider} from "../src/blitz-client"

type Props = {
  children: React.ReactNode
}

globalThis.__BLITZ_RSC = true

const BlitzProvider = ({children}: Props) => (
  <RSC_BlitzProvider client={queryClient}>{children}</RSC_BlitzProvider>
)

export default BlitzProvider
