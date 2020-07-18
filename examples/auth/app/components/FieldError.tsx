import React, {PropsWithoutRef} from "react"
import {useField} from "react-final-form"

export interface FieldErrorProps extends PropsWithoutRef<JSX.IntrinsicElements["div"]> {
  /** Field name to display the error for. */
  name: string
}

export const FieldError = ({name, ...props}: FieldErrorProps) => {
  const {
    meta: {touched, error, submitError},
  } = useField(name, {
    subscription: {touched: true, error: true, submitError: true},
  })
  if (!touched) return null
  if (!error && !submitError) return null

  return (
    <div role="alert" style={{color: "red"}} {...props}>
      {error || submitError}
    </div>
  )
}

export default FieldError
