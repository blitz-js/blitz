import React from "react"
import {Head, useRouter, BlitzPage} from "blitz"
import {LabeledTextField} from "app/components/LabeledTextField"
import {Form} from "react-final-form"
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
            <form onSubmit={handleSubmit} className="signup-form">
              <LabeledTextField name="email" label="Email" placeholder="Email" />
              <LabeledTextField
                name="password"
                label="Password"
                placeholder="Password"
                type="password"
              />

              {submitError && (
                <div role="alert" style={{color: "red"}}>
                  {submitError}
                </div>
              )}

              <button type="submit" disabled={submitting}>
                Create Account
              </button>

              <style global jsx>{`
                .signup-form > * + * {
                  margin-top: 1rem;
                }
              `}</style>
            </form>
          )}
        />
      </div>
    </>
  )
}

export default SignupPage
