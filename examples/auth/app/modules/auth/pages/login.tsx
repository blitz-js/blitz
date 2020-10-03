import {LoginForm} from "app/modules/auth/components/LoginForm"
import {BlitzPage, Head, useRouter} from "blitz"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Log In</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <LoginForm onSuccess={() => router.push("/")} />
      </div>
    </>
  )
}

export default SignupPage
