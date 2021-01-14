import { BlitzPage, useMutation } from "blitz"
import Layout from "app/layouts/Layout"
import { LabeledTextField } from "app/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/components/Form"
import { ForgotPasswordInput } from "app/auth/validations"
import forgotPassword from "app/auth/mutations/forgotPassword"

/*
 * By default this page renders the ForgotPasswordForm form which gets the user
 * email and sends password reset instructions.
 *
 * When they click the link in that email, they will be sent back to this same
 * page but with the token set as a query parameter like `?token=XXXXX`.
 *
 * The ResetPasswordForm is rendered if the `?token=` parameter is present in the URL
 */

const ForgotPasswordPage: BlitzPage = () => {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)

  return (
    <div>
      <h1>Forgot your password?</h1>

      {isSuccess ? (
        <div>
          <h2>Request Submitted</h2>
          <p>
            If your email is in our system, you will receive instructions to reset your password
            shortly.
          </p>
        </div>
      ) : (
        <Form
          submitText="Send Reset Password Instructions"
          schema={ForgotPasswordInput}
          initialValues={{ email: "" }}
          onSubmit={async (values) => {
            try {
              await forgotPasswordMutation(values)
            } catch (error) {
              return {
                [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
              }
            }
          }}
        >
          <LabeledTextField name="email" label="Email" placeholder="Email" />
        </Form>
      )}
    </div>
  )
}

ForgotPasswordPage.getLayout = (page) => <Layout title="Forgot Your Password?">{page}</Layout>

export default ForgotPasswordPage
