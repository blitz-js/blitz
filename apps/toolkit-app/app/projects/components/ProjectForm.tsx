import { Form, FormProps } from "app/core/components/Form"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Suspense } from "react"
import { z } from "zod"
export { FORM_ERROR } from "app/core/components/Form"

function ProjectFormSuspense<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name="name" label="Name" placeholder="Name" type="text" />
      {/* template: <__component__ name=__fieldName__ label=__Field_Name__ placeholder=__Field_Name__  type=__inputType__ /> */}
    </Form>
  )
}

export function ProjectForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectFormSuspense {...props} />
    </Suspense>
  )
}
