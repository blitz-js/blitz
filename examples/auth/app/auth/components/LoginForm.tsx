import React from "react"
import {LabeledTextField} from "app/components/LabeledTextField"
import {useForm} from "react-hook-form"
import login from "app/auth/mutations/login"

type LoginFormProps = {
  onSuccess?: () => void
}

export const LoginForm = (props: LoginFormProps) => {
  const {register, handleSubmit, errors, setError, formState} = useForm({
    mode: "onBlur",
    async resolver(values) {
      const errors: {email?: string; password?: string} = {}
      if (!values.email) errors.email = "Required"
      if (!values.password) errors.password = "Required"
      if (Object.keys(errors).length) {
        return {values: {}, errors}
      } else {
        return {values, errors: {}}
      }
    },
  })

  return (
    <div>
      <h1>Login</h1>
      <form
        onSubmit={handleSubmit(async (values) => {
          try {
            await login({email: values.email, password: values.password})
            props.onSuccess && props.onSuccess()
          } catch (error) {
            if (error.name === "AuthenticationError") {
              setError("email", {type: "manual", message: "Sorry, those credentials are invalid"})
            } else {
              setError("form", {
                type: "manual",
                message:
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
              })
            }
          }
        })}
        className="login-form"
      >
        <LabeledTextField
          name="email"
          label="Email"
          placeholder="Email"
          ref={register}
          formState={formState}
          errors={errors}
        />
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          ref={register}
          formState={formState}
          errors={errors}
        />

        {errors.form && (
          <div role="alert" style={{color: "red"}}>
            {errors.form.message}
          </div>
        )}

        <button type="submit" disabled={formState.isSubmitting}>
          Log In
        </button>

        <style global jsx>{`
          .login-form > * + * {
            margin-top: 1rem;
          }
        `}</style>
      </form>
    </div>
  )
}

export default LoginForm
