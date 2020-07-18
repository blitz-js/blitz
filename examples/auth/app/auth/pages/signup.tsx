import React from "react"
import {Head, useRouter, BlitzPage} from "blitz"
import {FieldError} from "app/components/FieldError"
import {Form, Field} from "react-final-form"
import {FORM_ERROR} from "final-form"
import signup from "app/auth/mutations/signup"
import {SignupInput} from "app/auth/validations"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <h1>Create an Account</h1>

        <Form
          validate={(values) => {
            try {
              SignupInput.parse(values)
            } catch (error) {
              return error.formErrors.fieldErrors
            }
          }}
          onSubmit={async (values) => {
            try {
              await signup({email: values.email, password: values.password})
              router.push("/")
            } catch (error) {
              if (error.meta?.target?.includes("email")) {
                return {
                  email: "This email is already being used",
                }
              } else {
                return {
                  [FORM_ERROR]: error.toString(),
                }
              }
            }
          }}
          render={({handleSubmit, submitting, submitError}) => (
            <form onSubmit={handleSubmit}>
              <label>
                Email
                <Field name="email" component="input" placeholder="Email" />
                <FieldError name="email" />
              </label>

              <label>
                Password
                <Field name="password" component="input" placeholder="Password" type="password" />
                <FieldError name="password" />
              </label>

              {submitError && (
                <div role="alert" style={{color: "red"}}>
                  {submitError}
                </div>
              )}

              <button type="submit" disabled={submitting}>
                Create Account
              </button>
            </form>
          )}
        />
        <style jsx>{`
          label {
            display: flex;
            flex-direction: column;
            align-items: start;
          }
          form > * + * {
            margin-top: 1rem;
          }
        `}</style>
      </div>
    </>
  )
}

export default SignupPage
