import { AuthenticationError, Link, useMutation, Routes } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/core/components/Form"
import login from "app/auth/mutations/login"
import { Login } from "app/auth/validations"
import { useI18n } from "next-rosetta"
import type { MyLocale } from "app/core/i18n"

type LoginFormProps = {
  onSuccess?: () => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const { t } = useI18n<MyLocale>()

  return (
    <div>
      <h1>{t("loginPage.login")}</h1>

      <Form
        submitText={t("loginPage.login") as string | undefined}
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            await loginMutation(values)
            props.onSuccess?.()
          } catch (error: any) {
            if (error instanceof AuthenticationError) {
              return { [FORM_ERROR]: t("loginPage.credentialError") }
            } else {
              return {
                [FORM_ERROR]: t("loginPage.unexpectedError", { message: error.toString() }),
              }
            }
          }
        }}
      >
        <LabeledTextField name="email" label={t("loginPage.email") as any} placeholder="Email" />
        <LabeledTextField
          name="password"
          label={t("loginPage.password") as any}
          placeholder="Password"
          type="password"
        />
        <div>
          <Link href={Routes.ForgotPasswordPage()}>
            <a>{t("loginPage.forgotPassword")}</a>
          </Link>
        </div>
      </Form>

      <div style={{ marginTop: "1rem" }}>
        {t("loginPage.Or")} <Link href={Routes.SignupPage()}>{t("loginPage.signUp")}</Link>
      </div>
    </div>
  )
}

export default LoginForm
