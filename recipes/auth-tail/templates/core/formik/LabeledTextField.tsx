import {forwardRef, PropsWithoutRef} from "react"
import {useField, useFormikContext, ErrorMessage} from "formik"

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
    const [input] = useField(name)
    const {isSubmitting, errors, touched} = useFormikContext()

    return (
      <div {...outerProps}>
        <label>
          {label}
          <input
            {...input}
            disabled={isSubmitting}
            {...props}
            ref={ref}
            className={[
              className,
              "form-input rounded-md my-2",
              // "border-[#EAEAEA] mt-3 border px-3 lg:px-4 py-2 rounded-md lg:rounded-xl focus:outline-none",
              errors?.[name] && touched?.[name]
                ? "ring-2 ring-offset-2 ring-red-500"
                : touched?.[name]
                ? "ring-2 ring-offset-2 ring-[#4424A7]"
                : "ring-2 ring-[#EAEAEA]",
            ].join(" ")}
          />
        </label>

        <ErrorMessage name={name}>
          {(msg) => (
            <div role="alert" style={{color: "red"}}>
              {msg}
            </div>
          )}
        </ErrorMessage>
      </div>
    )
  },
)

export default LabeledTextField
