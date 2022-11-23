import {Suspense} from "react"
import {Form, FormProps} from "src/core/components/Form"
import {LabeledTextField} from "src/core/components/LabeledTextField"

import {z} from "zod"
export {FORM_ERROR} from "src/core/components/Form"

function __ModelName__FormSuspense<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      {/* template: <__component__ name=__fieldName__ label=__Field_Name__ placeholder=__Field_Name__  type=__inputType__ /> */}
    </Form>
  )
}

export function ProjectForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <__ModelName__FormSuspense {...props} />
    </Suspense>
  )
}
