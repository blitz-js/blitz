import React from "react"
import {FieldError} from "app/components/FieldError"
import {Form, Field} from "react-final-form"
import {FORM_ERROR} from "final-form"
import login from "app/auth/mutations/login"

type LoginFormProps = {
  onSuccess?: () => void
}

export const LoginForm = (props: LoginFormProps) => {
  return (
    <div>
      <h1>Login</h1>

      <Form
        initialValues={{email: undefined, password: undefined}}
        validate={(values) => {
          const errors: {email?: string; password?: string} = {}
          if (!values.email) errors.email = "Required"
          if (!values.password) errors.password = "Required"
          return errors
        }}
        onSubmit={async (values) => {
          try {
            await login({email: values.email, password: values.password})
            props.onSuccess && props.onSuccess()
          } catch (error) {
            if (error.name === "AuthenticationError") {
              return {
                [FORM_ERROR]: "Sorry, those credentials are invalid",
              }
            } else {
              return {
                [FORM_ERROR]:
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
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
              Log In
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
  )
}

export default LoginForm
