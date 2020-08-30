import React from "react"
import {Head, useRouter, BlitzPage} from "blitz"
import {Form, FORM_ERROR} from "app/components/Form"
import {LabeledTextField} from "app/components/LabeledTextField"
import signup from "app/auth/mutations/signup"
import {SignupInput, SignupInputType} from "app/auth/validations"

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

        <Form<SignupInputType>
          submitText="Create Account"
          schema={SignupInput}
          onSubmit={async (values) => {
            try {
              await signup({email: values.email, password: values.password})
              router.push("/")
            } catch (error) {
              if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                // This error comes from Prisma
                return {email: "This email is already being used"}
              } else {
                return {
                  [FORM_ERROR]:
                    "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                }
              }
            }
          }}
        >
          <LabeledTextField name="email" label="Email" placeholder="Email" />
          <LabeledTextField
            name="password"
            label="Password"
            placeholder="Password"
            type="password"
          />
        </Form>
      </div>
    </>
  )
}

export default SignupPage
