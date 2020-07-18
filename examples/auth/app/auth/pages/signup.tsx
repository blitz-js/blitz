import React from "react"
import {Head, useRouter, BlitzPage} from "blitz"
import {LabeledTextField} from "app/components/LabeledTextField"
import {useForm} from "react-hook-form"
import signup from "app/auth/mutations/signup"
import {SignupInput} from "app/auth/validations"

const SignupPage: BlitzPage = () => {
  const router = useRouter()
  const {register, handleSubmit, errors, setError, formState} = useForm({
    mode: "onBlur",
    async resolver(values) {
      try {
        SignupInput.parse(values)
        return {values, errors: {}}
      } catch (error) {
        return {values: {}, errors: error.formErrors?.fieldErrors}
      }
    },
  })

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <h1>Create an Account</h1>

        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              await signup({email: values.email, password: values.password})
              router.push("/")
            } catch (error) {
              if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                // This error comes from Prisma
                setError("email", {type: "manual", message: "This email is already being used"})
              } else {
                setError("form", {type: "manual", message: error.toString()})
              }
            }
          })}
          className="signup-form"
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
            Create Account
          </button>

          <style global jsx>{`
            .signup-form > * + * {
              margin-top: 1rem;
            }
          `}</style>
        </form>
      </div>
    </>
  )
}

export default SignupPage
