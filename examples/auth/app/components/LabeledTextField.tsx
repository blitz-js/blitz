import React, {PropsWithoutRef} from "react"
import {useField} from "react-final-form"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number"
  groupProps?: PropsWithoutRef<JSX.IntrinsicElements["input"]>
}

export const LabeledTextField = ({name, label, groupProps, ...props}: LabeledTextFieldProps) => {
  const {
    input,
    meta: {touched, error, submitError, submitting},
  } = useField(name, {
    subscription: {
      value: true,
      touched: true,
      error: true,
      submitError: true,
      submitting: true,
    },
  })

  return (
    <div {...groupProps}>
      <label>
        {label}
        <input {...input} disabled={submitting} {...props} />
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
}

export default LabeledTextField
