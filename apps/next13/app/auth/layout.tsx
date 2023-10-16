import {useAuthenticatedBlitzContext} from "../../src/blitz-server"

export default async function RootLayout({children}: {children: React.ReactNode}) {
  await useAuthenticatedBlitzContext({
    redirectAuthenticatedTo: "/",
  })
  return <>{children}</>
}
