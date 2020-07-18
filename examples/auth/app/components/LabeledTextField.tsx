import React, {PropsWithoutRef} from "react"
import {useField} from "react-final-form"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
}

export const LabeledTextField = React.forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({name, label, outerProps, ...props}, ref) => {
    const {
      input,
      meta: {touched, error, submitError, submitting},
    } = useField(name)

    return (
      <div {...outerProps}>
        <label>
          {label}
          <input {...input} disabled={submitting} {...props} ref={ref} />
        </label>

        {touched && (error || submitError) && (
          <div role="alert" style={{color: "red"}}>
            {error || submitError}
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
