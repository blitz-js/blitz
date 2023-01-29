"use client"

import {BlitzRscProvider} from "../src/blitz-client"

type Props = {
  children: Element
}

globalThis.__BLITZ_RSC = true

const BlitzProvider = ({children}: Props) => <BlitzRscProvider>{children}</BlitzRscProvider>

export default BlitzProvider
