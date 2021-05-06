import {useRouter, BlitzPage, Routes} from "blitz"
import Layout from "app/core/layouts/Layout"
import {SignupForm} from "app/auth/components/SignupForm"

import s from "./signup.module.css"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div className={s.form_wrapper}>
      <div className={s.main_content}>
        <SignupForm onSuccess={() => router.push(Routes.Home())} />
      </div>
    </div>
  )
}

SignupPage.redirectAuthenticatedTo = "/"
SignupPage.getLayout = (page) => <Layout title="Sign Up">{page}</Layout>

export default SignupPage
