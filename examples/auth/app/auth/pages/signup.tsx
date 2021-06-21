import {useRouter, BlitzPage} from "blitz"
import Layout from "app/core/layouts/Layout"
import {SignupForm} from "app/auth/components/SignupForm"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div>
      <SignupForm />
    </div>
  )
}

SignupPage.getLayout = (page) => <Layout title="Sign Up">{page}</Layout>
SignupPage.authenticate = {redirectTo: "/"}

export default SignupPage
