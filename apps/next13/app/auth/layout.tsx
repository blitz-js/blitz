import {useAuthenticatedBlitzContext} from "@blitzjs/auth"

export default async function RootLayout({children}: {children: React.ReactNode}) {
  await useAuthenticatedBlitzContext({
    redirectAuthenticatedTo: "/",
  })
  return <>{children}</>
}
