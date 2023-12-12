import { useAuthenticatedBlitzContext } from "src/app/blitz-server"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({
    redirectTo: "/login",
  })
  return <>{children}</>
}
