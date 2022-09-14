import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import { SignupForm } from "app/auth/components/SignupForm"
import { BlitzPage, Routes } from "@blitzjs/next"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout title="Sign Up">
      <SignupForm onSuccess={() => router.push(Routes.Home())} />
    </Layout>
  )
}

export default SignupPage
