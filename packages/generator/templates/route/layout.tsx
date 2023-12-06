import { useAuthenticatedBlitzContext } from "app/src/blitz-server"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({
    redirectTo: "/login",
  })
  return <>{children}</>
}
