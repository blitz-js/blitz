import React, {useState} from "react"
import signUp from "app/users/mutations/signUp"
import login from "app/users/mutations/login"

type LoginFormProps = {
  onSuccess?: () => void
}

const LoginForm = (props: LoginFormProps) => {
  const [signUpError, setSignUpError] = useState("")
  const [loginError, setLoginError] = useState("")
  return (
    <div>
      <h1>Sign Up</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          const inputs = event.currentTarget.elements as any
          const input = {
            email: inputs.email.value,
            password: inputs.password.value,
          }
          const {email, password} = input
          try {
            setSignUpError("")
            await signUp({email, password})
          } catch (error) {
            if (error.code === "P2002" && error.meta?.target?.includes("email")) {
              setSignUpError("That email is already being used")
            } else {
              setSignUpError(error.toString())
            }
          }
        }}
      >
        <label>
          Email
          <input name="email" />
        </label>
        <label>
          Password
          <input name="password" />
        </label>
        {signUpError && <p style={{color: "red"}}>{signUpError}</p>}
        <button>Sign Up</button>
      </form>

      <h1>Login</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          try {
            setLoginError("")
            const inputs = event.currentTarget.elements as any
            await login({email: inputs.email.value, password: inputs.password.value})
            props.onSuccess && props.onSuccess()
          } catch (error) {
            if (error.name === "AuthenticationError") {
              setLoginError("Those login credentials are invalid")
            } else {
              setLoginError("Sorry, we had an unexpected error. Please try again. - " + error)
            }
          }
        }}
      >
        <label>
          Email
          <input name="email" />
        </label>
        <label>
          Password
          <input name="password" />
        </label>
        {loginError && <p style={{color: "red"}}>{loginError}</p>}
        <button>Login</button>
      </form>
    </div>
  )
}

export default LoginForm
