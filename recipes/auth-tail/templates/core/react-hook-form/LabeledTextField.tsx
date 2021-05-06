import {forwardRef, PropsWithoutRef} from "react"
import {useFormContext} from "react-hook-form"

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
  ({label, outerProps, name, className, ...props}, ref) => {
    const {
      register,
      formState: {isSubmitting, errors},
    } = useFormContext()
    const error = Array.isArray(errors[name])
      ? errors[name].join(", ")
      : errors[name]?.message || errors[name]

    return (
      <div {...outerProps}>
        <label>
          {label}
          <input
            disabled={isSubmitting}
            {...register(name)}
            {...props}
            ref={ref}
            className={[
              className,
              "form-input rounded-md my-2",
              // "border-[#EAEAEA] mt-3 border px-3 lg:px-4 py-2 rounded-md lg:rounded-xl focus:outline-none",
              error && "ring-2 ring-offset-2 ring-red-500",
            ].join(" ")}
            onFocus={(e) => e.target.classList.add("ring-2 ring-offset-2 ring-[#4424A7]")}
            onBlur={(e) => e.target.classList.add("ring-2 ring-[#EAEAEA]")}
          />
        </label>

        {error && (
          <div role="alert" style={{color: "red"}}>
            {error}
          </div>
        )}
      </div>
    )
  },
)

export default LabeledTextField
