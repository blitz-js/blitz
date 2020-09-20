import React, { useState } from "react"
import { BlitzPage, useRouterQuery, Link } from "blitz"
import Layout from "app/layouts/Layout"
import { LabeledTextField } from "app/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/components/Form"
import {
  ForgotPasswordInput,
  ForgotPasswordInputType,
  ResetPasswordInput,
  ResetPasswordInputType,
} from "app/auth/validations"
import forgotPassword from "app/auth/mutations/forgotPassword"
import resetPassword from "app/auth/mutations/resetPassword"

/*
 * By default this page renders the ForgotPasswordForm form which gets the user
 * email and sends password reset instructions.
 *
 * When they click the link in that email, they will be sent back to this same
 * page but with the token set as a query paramater like `?token=XXXXX`.
 *
 * The ResetPasswordForm is rendered if the `?token=` paramater is present in the URL
 */

const ForgotPasswordForm = () => {
  const [success, setSuccess] = useState(false)
  return (
    <div>
      <h1>Forgot your password?</h1>

      {success ? (
        <div>
          <h2>Request Submitted</h2>
          <p>
            If your email is in our system, you will receive instructions to reset your password
            shortly.
          </p>
        </div>
      ) : (
        <Form<ForgotPasswordInputType>
          submitText="Send Reset Password Instructions"
          schema={ForgotPasswordInput}
          initialValues={{ email: "" }}
          onSubmit={async (values) => {
            try {
              await forgotPassword(values)
              setSuccess(true)
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

const ResetPasswordForm = () => {
  const query = useRouterQuery()
  const [success, setSuccess] = useState(false)
  return (
    <div>
      <h1>Set a New Password</h1>

      {success ? (
        <div>
          <h2>Password Reset Successfully</h2>
          <p>
            You may now <Link href="/login">log in with your new password</Link>
          </p>
        </div>
      ) : (
        <Form<ResetPasswordInputType>
          submitText="Reset Password"
          schema={ResetPasswordInput}
          initialValues={{ password: "", passwordConfirmation: "", token: query.token as string }}
          onSubmit={async (values) => {
            try {
              await resetPassword(values)
              setSuccess(true)
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

const ForgotPasswordPage: BlitzPage = () => {
  const query = useRouterQuery()

  return query.token ? <ResetPasswordForm /> : <ForgotPasswordForm />
}

ForgotPasswordPage.getLayout = (page) => <Layout title="Forgot Your Password?">{page}</Layout>

export default ForgotPasswordPage
