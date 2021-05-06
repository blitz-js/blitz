import {forwardRef, PropsWithoutRef} from "react"
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

export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({name, label, outerProps, className, ...props}, ref) => {
    const {
      input,
      meta: {touched, error, submitError, submitting, active},
    } = useField(name, {
      parse: props.type === "number" ? Number : undefined,
    })

    const normalizedError = Array.isArray(error) ? error.join(", ") : error || submitError

    return (
      <div {...outerProps}>
        <label>
          {label}
          <input
            {...input}
            disabled={submitting}
            {...props}
            ref={ref}
            className={[
              className,
              "form-input rounded-md my-2",
              // "border-[#EAEAEA] mt-3 border px-3 lg:px-4 py-2 rounded-md lg:rounded-xl focus:outline-none",
              error?.[name] && active
                ? "ring-2 ring-offset-2 ring-red-500"
                : active
                ? "ring-2 ring-offset-2 ring-[#4424A7]"
                : "ring-2 ring-[#EAEAEA]",
            ].join(" ")}
          />
        </label>

        {touched && normalizedError && (
          <div role="alert" style={{color: "red"}}>
            {normalizedError}
          </div>
        )}
      </div>
    )
  },
)

export default LabeledTextField
