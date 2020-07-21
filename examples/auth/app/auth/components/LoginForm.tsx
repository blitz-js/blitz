import React from "react"
import {LabeledTextField} from "app/components/LabeledTextField"
import {Form} from "app/components/Form"
import login from "app/auth/mutations/login"
import {LoginInput, LoginInputType} from "app/auth/validations"

type LoginFormProps = {
  onSuccess?: () => void
}

export const LoginForm = (props: LoginFormProps) => {
  return (
    <div>
      <h1>Login</h1>

      <Form<LoginInputType>
        submitText="Log In"
        schema={LoginInput}
        onSubmit={async (values) => {
          try {
            await login({email: values.email, password: values.password})
            props.onSuccess && props.onSuccess()
          } catch (error) {
            if (error.name === "AuthenticationError") {
              setError("form", {
                type: "manual",
                message: "Sorry, those credentials are invalid",
              })
            } else {
              setError("form", {
                type: "manual",
                message:
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
              })
            }
          }
        }}
      >
        <LabeledTextField name="email" label="Email" placeholder="Email" />
        <LabeledTextField name="password" label="Password" placeholder="Password" type="password" />
      </Form>
    </div>
  )
}

export default LoginForm
