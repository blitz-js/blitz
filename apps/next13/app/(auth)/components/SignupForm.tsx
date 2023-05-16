import Link from "next/link"
import {Signup} from "../validations"
import {useMutation} from "@blitzjs/rpc"
import {startTransition} from "react"
import {useRouter} from "next/navigation"
import {FieldApi, createFormFactory} from "@tanstack/react-form"
import * as z from "zod"
import {AuthenticationError} from "blitz"
import { zodValidate } from "@/app/core/validators/zod"
import signup from "../mutations/signup"

type TSignup = z.infer<typeof Signup>

const formFactory = createFormFactory<TSignup>({
  defaultValues: {
    email: "",
    password: "",
  },
})

function FieldInfo({field}: {field: FieldApi<any, any>}) {
  return (
    <>
      {field.state.meta.touchedError ? <em>{field.state.meta.touchedError}</em> : null}{" "}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  )
}

export const SignupForm = () => {
  const [signupMutation] = useMutation(signup)
  const router = useRouter()
  const form = formFactory.useForm({
    onSubmit: async (values, formApi) => {
      try {
        await signupMutation(values)
        startTransition(() => {
          // Refresh the current route and fetch new data from the server without
          // losing client-side browser or React state.
          router.refresh()
        })
      } catch (error: any) {
        if (
          error instanceof AuthenticationError ||
          error.toString().includes("AuthenticationError")
        ) {
          return (formApi.state.fieldMeta.password.touchedError =
            "Invalid email or password. Please try again.")
        }
        if (error.code === "P2002" && error.meta?.target?.includes("email")) {
          // Error "P2002" comes from Prisma (https://www.prisma.io/docs/reference/api-reference/error-reference#p2002)
          return (formApi.state.fieldMeta.email.touchedError =
            "This email is already being used. Please try again.")
        } else {
          return (formApi.state.fieldMeta.password.touchedError = error.toString())
        }
      }
    },
  })
  return (
    <div>
      <h1>Signup</h1>

      <form.Provider>
        <form {...form.getFormProps()}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              maxWidth: "20rem",
            }}
          >
            {/* A type-safe and pre-bound field component*/}
            <form.Field
              name="email"
              validate={(value) => {
                return zodValidate(Signup, "email")(value)
              }}
              children={(field) => {
                // Avoid hasty abstractions. Render props are great!
                return (
                  <>
                    <label htmlFor={field.name}>Email:</label>
                    <input name={field.name} {...field.getInputProps()} />
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
            <form.Field
              name="password"
              validate={(value) => {
                return zodValidate(Signup, "password")(value)
              }}
              children={(field) => {
                // Avoid hasty abstractions. Render props are great!
                return (
                  <>
                    <label htmlFor={field.name}>Password:</label>
                    <input type="password" name={field.name} {...field.getInputProps()} />
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button type="submit" disabled={!canSubmit} style={{marginTop: "1rem"}}>
                {isSubmitting ? "..." : "Submit"}
              </button>
            )}
          />
        </form>
      </form.Provider>

      <div style={{marginTop: "1rem"}}>
        Or <Link href="/signup">Sign Up</Link>
      </div>
    </div>
  )
}

export default SignupForm
