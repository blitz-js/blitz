import {AuthenticationError, PromiseReturnType} from "blitz"
import Link from "next/link"
import {LabeledTextField} from "../../core/components/LabeledTextField"
import {Form, FORM_ERROR} from "../../core/components/Form"
import login from "../../auth/mutations/login"
import {Login} from "../../auth/validations"
import {useMutation} from "@blitzjs/rpc"
import {startTransition, useMemo} from "react"
import {useRouter} from "next/navigation"
import {FieldApi, FormApi, createFormFactory, useField} from "@tanstack/react-form"
import * as z from "zod"

type Person = z.infer<typeof Login>

const formFactory = createFormFactory<Person>({
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

export const LoginForm = () => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()
  const form = formFactory.useForm({
    onSubmit: async (values, formApi) => {
      // Do something with form data
      console.log(values)
    },
  })
  return (
    <div>
      <h1>Login</h1>

      <form.Provider>
        <form {...form.getFormProps()}>
          <div>
            {/* A type-safe and pre-bound field component*/}
            <form.Field
              name="email"
              validate={(value) => {
                if (!value) {
                  return "Email is required"
                }
                const result = Login.partial({
                  email: true,
                }).safeParse({
                  email: value,
                })
                console.log(result)
                if (result.success) {
                  return null
                } else {
                  return JSON.parse(result.error.message)[0].message
                }
              }}
              children={(field) => {
                // Avoid hasty abstractions. Render props are great!
                return (
                  <>
                    <input {...field.getInputProps()} />
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button type="submit" disabled={!canSubmit}>
                {isSubmitting ? "..." : "Submit"}
              </button>
            )}
          />
        </form>
      </form.Provider>

      <div style={{marginTop: "1rem"}}>
        Or <Link href={"/auth/signup"}>Sign Up</Link>
      </div>
    </div>
  )
}

export default LoginForm
