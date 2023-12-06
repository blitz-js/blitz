"use client"
import { FORM_ERROR, __ModelName__Form } from "./__ModelName__Form"
import { Create__ModelName__Schema } from "../schemas"
import { useMutation } from "@blitzjs/rpc"
import create__ModelName__ from "../mutations/create__ModelName__"
import { useRouter } from "next/navigation"

export function New__ModelName__Form() {
  const [create__ModelName__Mutation] = useMutation(create__ModelName__)
  const router = useRouter()
  return (
    <__ModelName__Form
      submitText="Create __ModelName__"
      schema={Create__ModelName__Schema}
      onSubmit={async (values) => {
        try {
          const __modelName__ = await create__ModelName__Mutation(values)
          router.push(`/__modelNames__/${__modelName__.id}`)
        } catch (error: any) {
          console.error(error)
          return {
            [FORM_ERROR]: error.toString(),
          }
        }
      }}
    />
  )
}
