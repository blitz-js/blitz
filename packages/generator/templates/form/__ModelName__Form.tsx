import React, {Suspense} from "react"
import {Form, FormProps} from "src/core/components/Form"
import {LabeledTextField} from "src/core/components/LabeledTextField"

import {z} from "zod"
export {FORM_ERROR} from "src/core/components/Form"

export function __ModelName__Form<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      {/* template: <__component__ name="__fieldName__" label="__Field_Name__" placeholder="__Field_Name__"  type="__inputType__" /> */}
    </Form>
  )
}
