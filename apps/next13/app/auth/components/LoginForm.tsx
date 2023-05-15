import {AuthenticationError, PromiseReturnType} from "blitz"
import Link from "next/link"
import {LabeledTextField} from "../../core/components/LabeledTextField"
import {Form, FORM_ERROR} from "../../core/components/Form"
import login from "../../auth/mutations/login"
import {Login} from "../../auth/validations"
import {useMutation} from "@blitzjs/rpc"
import {startTransition, useMemo} from "react"
import {useRouter} from "next/navigation"
import {
  FieldApi,
  FormApi,
  createFormFactory,
  useField,
} from "@tanstack/react-form";

type Person = {
  firstName: string;
  lastName: string;
};

type Hobby = {
  name: string;
  description: string;
  yearsOfExperience: number;
};

const formFactory = createFormFactory<Person>({
  defaultValues: {
    firstName: "",
    lastName: "",
  },
});

function FieldInfo({ field }: { field: FieldApi<any, any> }) {
  return (
    <>
      {field.state.meta.touchedError ? (
        <em>{field.state.meta.touchedError}</em>
      ) : null}{" "}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export const LoginForm = () => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()
  const form = formFactory.useForm({
    onSubmit: async (values, formApi) => {
      // Do something with form data
      console.log(values);
    },
  });
  return (
    <div>
      <h1>Login</h1>

      <form.Provider>
        <form {...form.getFormProps()}>
          <div>
            {/* A type-safe and pre-bound field component*/}
            <form.Field
              name="firstName"
              onChange={(value) =>
                !value
                  ? "A first name is required"
                  : value.length < 3
                  ? "First name must be at least 3 characters"
                  : undefined
              }
              onChangeAsync={async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return (
                  value.includes("error") && 'No "error" allowed in first name'
                );
              }}
              children={(field) => {
                // Avoid hasty abstractions. Render props are great!
                return (
                  <>
                    <input {...field.getInputProps()} />
                    <FieldInfo field={field} />
                  </>
                );
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
