import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"

export interface LabeledSelectFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["select"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  options: any[]
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
}

export const LabeledSelectField = forwardRef<HTMLSelectElement, LabeledSelectFieldProps>(
  ({ label, outerProps, labelProps, name, options, ...props }, ref) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()
    return (
      <div {...outerProps}>
        <label {...labelProps}>
          {label}
          <select {...register(name)} disabled={isSubmitting} {...props}>
            {options &&
              options.map((value) => (
                <option value={value.id} key={value.id}>
                  {value[name]}
                </option>
              ))}
          </select>
        </label>
        <ErrorMessage
          render={({ message }) => (
            <div role="alert" style={{ color: "red" }}>
              {message}
            </div>
          )}
          errors={errors}
          name={name}
        />
        <style jsx>{`
          label {
            display: flex;
            flex-direction: column;
            align-items: start;
            font-size: 1rem;
          }
          select {
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            border: 1px solid purple;
            appearance: none;
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
)
