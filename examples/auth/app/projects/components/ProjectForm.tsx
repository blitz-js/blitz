import {Form, FormProps} from "app/core/components/Form"
import {LabeledTextField} from "app/core/components/LabeledTextField"
import {ZodType} from "zod"
export {FORM_ERROR} from "app/core/components/Form"

export function ProjectForm<S extends ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name="name" label="Name" placeholder="Name" />
    </Form>
  )
}
