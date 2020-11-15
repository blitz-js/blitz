import React, { useState, ReactNode, PropsWithoutRef } from "react"
import { FormProvider, useForm, UseFormOptions } from "react-hook-form"
import * as z from "zod"

type FormProps<S extends z.ZodType<any, any>> = {
  /** All your form fields */
  children: ReactNode
  /** Text to display in the submit button */
  submitText: string
  schema?: S
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  initialValues?: UseFormOptions<z.infer<S>>["defaultValues"]
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit">

type OnSubmitResult = {
  FORM_ERROR?: string
  [prop: string]: any
}

export const FORM_ERROR = "FORM_ERROR"

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  schema,
  initialValues,
  onSubmit,
  ...props
}: FormProps<S>) {
  const ctx = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: async (values) => {
      try {
        if (schema) {
          schema.parse(values)
        }
        return { values, errors: {} }
      } catch (error) {
        return { values: {}, errors: error.formErrors?.fieldErrors }
      }
    },
    defaultValues: initialValues,
  })
  const [formError, setFormError] = useState<string | null>(null)

  return (
    <FormProvider {...ctx}>
      <form
        onSubmit={ctx.handleSubmit(async (values) => {
          const result = (await onSubmit(values)) || {}
          for (const [key, value] of Object.entries(result)) {
            if (key === FORM_ERROR) {
              setFormError(value)
            } else {
              ctx.setError(key as any, {
                type: "submit",
                message: value,
              })
            }
          }
        })}
        className="form"
        {...props}
      >
        {/* Form fields supplied as children are rendered here */}
        {children}

        {formError && (
          <div role="alert" style={{ color: "red" }}>
            {formError}
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
