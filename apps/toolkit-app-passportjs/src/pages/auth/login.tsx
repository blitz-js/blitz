import Layout from "app/core/layouts/Layout"
import { LoginForm } from "app/auth/components/LoginForm"
import { useRouter } from "next/router"
import { BlitzPage } from "@blitzjs/next"
import Link from "next/link"

const LoginPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout title="Log In">
      <LoginForm
        onSuccess={(_user) => {
          const next = router.query.next ? decodeURIComponent(router.query.next as string) : "/"
          return router.push(next)
        }}
      />

      <Link href={"/api/auth/mock1"}>Sign in as Mock User 1</Link>

      <Link href={"/api/auth/mock2"}>Sign in as Mock User 2</Link>

      <Link href={"/api/auth/localhost"}>Sign in as Mock User 3</Link>
    </Layout>
  )
}

export default LoginPage
