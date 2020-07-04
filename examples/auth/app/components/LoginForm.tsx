import React, {useState} from "react"
import signUp from "app/users/mutations/signUp"
import login from "app/users/mutations/login"

type LoginFormProps = {
  onSuccess?: () => void
}

const LoginForm = (props: LoginFormProps) => {
  const [loginError, setLoginError] = useState("")
  return (
    <div>
      <h1>Sign Up</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          const inputs = event.currentTarget.elements as any
          await signUp({email: inputs.email.value, password: inputs.password.value})
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
