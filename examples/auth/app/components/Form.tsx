import React, {ReactNode, PropsWithoutRef} from "react"
import {FormProvider, useForm, SubmitHandler, UseFormOptions} from "react-hook-form"
import * as z from "zod"
export {FORM_ERROR} from "final-form"

type FormProps<FormValues> = {
  /** All your form fields */
  children: ReactNode
  /** Text to display in the submit button */
  submitText: string
  onSubmit: SubmitHandler<FormValues>
  initialValues?: UseFormOptions<FormValues>["defaultValues"]
  schema?: z.ZodType<any, any>
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit">

export function Form<FormValues extends Record<string, unknown>>({
  children,
  submitText,
  schema,
  initialValues,
  onSubmit,
  ...props
}: FormProps<FormValues>) {
  const ctx = useForm<FormValues>({
    // TODO: try onChange
    mode: "onBlur",
    resolver: async (values) => {
      try {
        if (schema) {
          schema.parse(values)
        }
        return {values, errors: {}}
      } catch (error) {
        return {values: {}, errors: error.formErrors?.fieldErrors} as any
      }
    },
    defaultValues: initialValues,
  })

  return (
    <FormProvider {...ctx}>
      <form onSubmit={ctx.handleSubmit(onSubmit)} className="form" {...props}>
        {/* Form fields supplied as children are rendered here */}
        {children}

        {ctx.errors.form && (
          <div role="alert" style={{color: "red"}}>
            {ctx.errors.form.message}
          </div>
        )}

        <button type="submit" disabled={ctx.formState.isSubmitting}>
          {submitText}
        </button>

        <style global jsx>{`
          .form > * + * {
            margin-top: 1rem;
          }
        `}</style>
      </form>
    </FormProvider>
  )
}

export default Form
