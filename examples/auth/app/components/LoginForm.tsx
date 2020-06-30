import React from "react"
import {Router} from "blitz"
import signUp from "app/users/mutations/signUp"
import login from "app/users/mutations/login"

const LoginForm = () => {
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
          const inputs = event.currentTarget.elements as any
          await login({email: inputs.email.value, password: inputs.password.value})
          Router.reload()
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
        <button>Login</button>
      </form>
    </div>
  )
}

export default LoginForm
