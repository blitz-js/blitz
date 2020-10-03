import {Form, FORM_ERROR} from "app/components/Form"
import {LabeledTextField} from "app/components/LabeledTextField"
import signup from "app/modules/auth/mutations/signup"
import {SignupInput} from "app/modules/auth/validations"
import {BlitzPage, Head, useMutation, useRouter} from "blitz"

const SignupPage: BlitzPage = () => {
  const router = useRouter()
  const [signupMutation] = useMutation(signup)

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <h1>Create an Account</h1>

        <Form
          submitText="Create Account"
          schema={SignupInput}
          onSubmit={async (values) => {
            try {
              await signupMutation(values)
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
