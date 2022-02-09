import { BlitzPage, useRouterQuery, Link, useMutation, Routes, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import confirmEmail from "app/auth/mutations/confirmEmail"
import { useState } from "react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"

const ConfirmPassswordPage: BlitzPage = () => {
  const query = useRouterQuery()
  const router = useRouter()
  const user = useCurrentUser()
  const [error, setError] = useState<string | null>(null)
  const [resetPasswordMutation, { isSuccess }] = useMutation(confirmEmail)

  if (user && user.verified) {
    router.push("/")
    return <>Loading...</>
  }

  return (
    <div>
      <h1>Confirm your email</h1>
      {error && !isSuccess && <p>{error}</p>}
      {isSuccess ? (
        <div>
          <h2>Email confirmed successfully</h2>
          <p>
            Go to the <Link href={Routes.Home()}>homepage</Link>
          </p>
        </div>
      ) : (
        <button
          onClick={async () => {
            try {
              await resetPasswordMutation({ token: query.token as string })
            } catch (error: any) {
              if (error.name === "ResetPasswordError") {
                setError(error.message)
              } else {
                setError("An unexpected error occurred")
              }
            }
          }}
        >
          Confirm Email
        </button>
      )}
    </div>
  )
}

ConfirmPassswordPage.getLayout = (page) => (
  <Layout title="Reset Your Password" noVerification>
    {page}
  </Layout>
)

export default ConfirmPassswordPage
