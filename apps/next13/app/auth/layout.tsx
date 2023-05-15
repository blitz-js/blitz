import {useAuthenticatedBlitzContext} from "@blitzjs/auth"

export default async function AuthLayout({children}: {children: React.ReactNode}) {
  await useAuthenticatedBlitzContext({
    redirectAuthenticatedTo: "/",
  })
  return <>{children}</>
}
