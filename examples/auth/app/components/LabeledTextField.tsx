import React, {PropsWithoutRef} from "react"
import {FormStateProxy} from "react-hook-form/dist/types/form"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  errors: Record<string, any>
  formState: FormStateProxy
}

export const LabeledTextField = React.forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({label, outerProps, formState, errors, ...props}, ref) => {
    const error = Array.isArray(errors[props.name])
      ? errors[props.name].join(", ")
      : errors[props.name]?.message

    return (
      <div {...outerProps}>
        <label>
          {label}
          <input disabled={formState.isSubmitting} {...props} ref={ref} />
        </label>

        {error && (
          <div role="alert" style={{color: "red"}}>
            {error}
          </div>
        )}

        <style jsx>{`
          label {
            display: flex;
            flex-direction: column;
            align-items: start;
          }
        `}</style>
      </div>
    )
  },
)

export default LabeledTextField
