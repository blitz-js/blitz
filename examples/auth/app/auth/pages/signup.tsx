import {Head, useRouter, BlitzPage, useMutation} from "blitz"
import Layout from "app/core/layouts/Layout"
import {Form, FORM_ERROR} from "app/core/components/Form"
import {LabeledTextField} from "app/core/components/LabeledTextField"
import {SignupForm} from "app/auth/components/SignupForm"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div>
      <SignupForm onSuccess={() => router.push("/")} />
    </div>
  )
}

SignupPage.getLayout = (page) => <Layout title="Sign Up">{page}</Layout>

export default SignupPage
