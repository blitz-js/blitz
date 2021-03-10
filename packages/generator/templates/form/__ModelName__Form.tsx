import {Form, FormProps} from "app/core/components/Form"
import {LabeledTextField} from "app/core/components/LabeledTextField"
import * as z from "zod"
export {FORM_ERROR} from "app/core/components/Form"

export function __ModelName__Form<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      {/* template: <LabeledTextField name="__fieldName__" label="__FieldName__" placeholder="__FieldName__" /> */}
    </Form>
  )
}

