import { BlitzPage, useRouterQuery, Link, useMutation } from "blitz"
import Layout from "app/layouts/Layout"
import { LabeledTextField } from "app/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/components/Form"
import { ResetPasswordInput } from "app/auth/validations"
import resetPassword from "app/auth/mutations/resetPassword"

/*
 * By default this page renders the ForgotPasswordForm form which gets the user
 * email and sends password reset instructions.
 *
 * When they click the link in that email, they will be sent back to this same
 * page but with the token set as a query parameter like `?token=XXXXX`.
 *
 * The ResetPasswordForm is rendered if the `?token=` parameter is present in the URL
 */

const ResetPasswordPage: BlitzPage = () => {
  const query = useRouterQuery()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  return (
    <div>
      <h1>Set a New Password</h1>

      {isSuccess ? (
        <div>
          <h2>Password Reset Successfully</h2>
          <p>
            Go to the <Link href="/">homepage</Link>
          </p>
        </div>
      ) : (
        <Form
          submitText="Reset Password"
          schema={ResetPasswordInput}
          initialValues={{ password: "", passwordConfirmation: "", token: query.token as string }}
          onSubmit={async (values) => {
            try {
              await resetPasswordMutation(values)
            } catch (error) {
              if (error.name === "ResetPasswordError") {
                return {
                  [FORM_ERROR]: error.message,
                }
              } else {
                return {
                  [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                }
              }
            }
          }}
        >
          <LabeledTextField name="password" label="New Password" type="password" />
          <LabeledTextField
            name="passwordConfirmation"
            label="Confirm New Password"
            type="password"
          />
        </Form>
      )}
    </div>
  )
}

ResetPasswordPage.getLayout = (page) => <Layout title="Reset Your Password">{page}</Layout>

export default ResetPasswordPage
