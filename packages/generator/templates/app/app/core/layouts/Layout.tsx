import {Head, BlitzLayout, useMutation} from "blitz"
import {useCurrentUser} from "app/core/hooks/useCurrentUser"
import sendConfirmationEmail from "app/auth/mutations/sendConfirmationEmail"

const Layout: BlitzLayout<{title?: string}> = ({title, noVerification, children}) => {
  const [sendConfirmationEmailMutation] = useMutation(sendConfirmationEmail)
  const user = useCurrentUser()

  if (user && !user.verified && !noVerification) {
    return (
      <div>
        You need to verify your email.{" "}
        <button
          onClick={() => {
            ;(async () => {
              await sendConfirmationEmailMutation()
            })()
          }}
        >
          Click here
        </button>{" "}
        to resend the email
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{title || "__name__"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {children}
    </>
  )
}

export default Layout
