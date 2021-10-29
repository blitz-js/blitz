import { useRouter, BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import { SignupForm } from "app/auth/components/SignupForm"
import { Routes } from ".blitz"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div>
      <SignupForm onSuccess={() => router.push(Routes.Home())} />
    </div>
  )
}

SignupPage.redirectAuthenticatedTo = "/"
SignupPage.getLayout = (page) => <Layout title="Sign Up">{page}</Layout>

export default SignupPage
