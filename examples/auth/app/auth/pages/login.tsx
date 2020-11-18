import {Head, useRouter, BlitzPage} from "blitz"
import {LoginForm} from "app/auth/components/LoginForm"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <LoginForm onSuccess={() => router.push("/")} />
      </div>
    </>
  )
}

export default SignupPage
