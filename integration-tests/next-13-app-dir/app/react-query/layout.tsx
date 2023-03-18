import {BlitzProvider} from "../../src/blitz-client"

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <BlitzProvider>{children}</BlitzProvider>
}
