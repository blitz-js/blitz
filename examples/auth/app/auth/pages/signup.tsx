import React from "react"
import {Head, useRouter, BlitzPage} from "blitz"
import {LabeledTextField} from "app/components/LabeledTextField"
import {FormProvider, useForm} from "react-hook-form"
import signup from "app/auth/mutations/signup"
import {SignupInput} from "app/auth/validations"

const SignupPage: BlitzPage = () => {
  const router = useRouter()
  const methods = useForm({
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

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(async (values) => {
              try {
                await signup({email: values.email, password: values.password})
                router.push("/")
              } catch (error) {
                if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                  // This error comes from Prisma
                  methods.setError("email", {
                    type: "manual",
                    message: "This email is already being used",
                  })
                } else {
                  methods.setError("form", {type: "manual", message: error.toString()})
                }
              }
            })}
            className="signup-form"
          >
            <LabeledTextField name="email" label="Email" placeholder="Email" />
            <LabeledTextField
              name="password"
              label="Password"
              placeholder="Password"
              type="password"
            />

            {methods.errors.form && (
              <div role="alert" style={{color: "red"}}>
                {methods.errors.form.message}
              </div>
            )}

            <button type="submit" disabled={methods.formState.isSubmitting}>
              Create Account
            </button>

            <style global jsx>{`
              .signup-form > * + * {
                margin-top: 1rem;
              }
            `}</style>
          </form>
        </FormProvider>
      </div>
    </>
  )
}

export default SignupPage
