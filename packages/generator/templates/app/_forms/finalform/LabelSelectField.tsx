import React, { PropsWithoutRef } from "react"
import { useField, UseFieldConfig } from "react-final-form"
import { useId } from "@reach/auto-id"

export interface LabeledSelectFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["select"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "number"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  fieldProps?: UseFieldConfig<string>
}

export const LabeledSelectField = React.forwardRef<HTMLSelectElement, LabeledSelectFieldProps>(
  ({ name, label, fieldProps, outerProps, ...props }, ref) => {
    const {
      input,
      meta: { touched, error, submitError, submitting },
    } = useField(name, {
      ...((props.type === "number"
        ? { parse: (v: string) => Number(v) }
        : {
            parse: (v: string) => (v === "" ? null : v),
          }) as any),
      ...fieldProps,
    })
    const id = useId() + "name"

    const normalizedError = Array.isArray(error) ? error.join(", ") : error || submitError
    const showError = touched && normalizedError

    return (
      <div {...outerProps}>
        <div>
          <label htmlFor={id} >
            {label}
          </label>
          <div role="alert">
            {showError && normalizedError}
          </div>
        </div>
        <select
          id={id}
          key={id}
          {...input}
          disabled={submitting}
          {...props}
          ref={ref}
        />
      </div>
    )
  }
)