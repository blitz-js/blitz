import { forwardRef, PropsWithoutRef } from "react";
import { useFormikContext, ErrorMessage, Field } from "formik";

export interface LabeledSelectFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["select"]> {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;
  /** Field options. */
  options: any;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
}

export const LabeledSelectField = forwardRef<
  HTMLSelectElement,
  LabeledSelectFieldProps
>(({ name, label, outerProps, options, ...props }, ref) => {
  const { isSubmitting } = useFormikContext();
  return (
    <div {...outerProps}>
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          fontSize: "1rem",
        }}
      >
        {label}
        <Field
          {...props}
          disabled={isSubmitting}
          ref={ref}
          name={name}
          as="select"
          style={{
            fontSize: "1rem",
            padding: " 0.25rem 0.4rem",
            borderRadius: "3px",
            border: "1px solid purple",
            marginTop: "0.5rem",
            backgroundColor: "white",
          }}
        >
          <option value="" selected disabled hidden>
            Select {label}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.id}>
              {option[name]}
            </option>
          ))}
        </Field>
      </label>

      <ErrorMessage name={name}>
        {(msg) => (
          <div role="alert" style={{ color: "red" }}>
            {msg}
          </div>
        )}
      </ErrorMessage>
    </div>
  );
});

export default LabeledSelectField;
