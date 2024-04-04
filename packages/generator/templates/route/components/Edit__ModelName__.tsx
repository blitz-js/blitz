"use client"
import { Suspense } from "react"
import update__ModelName__ from "../mutations/update__ModelName__"
import get__ModelName__ from "../queries/get__ModelName__"
import { Update__ModelName__Schema } from "../schemas"
import { FORM_ERROR, __ModelName__Form } from "./__ModelName__Form"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"

export const Edit__ModelName__ = ({ __modelId__ }: { __modelId__: number }) => {
  const [__modelName__, { setQueryData }] = useQuery(
    get__ModelName__,
    { id: __modelId__ },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [update__ModelName__Mutation] = useMutation(update__ModelName__)
  const router = useRouter()
  return (
    <>
      <div>
        <h1>Edit __ModelName__ {__modelName__.id}</h1>
        <pre>{JSON.stringify(__modelName__, null, 2)}</pre>
        <Suspense fallback={<div>Loading...</div>}>
          <__ModelName__Form
            submitText="Update __ModelName__"
            schema={Update__ModelName__Schema}
            initialValues={__modelName__}
            onSubmit={async (values) => {
              try {
                const updated = await update__ModelName__Mutation({
                  ...values,
                  id: __modelName__.id,
                })
                await setQueryData(updated)
                router.refresh()
              } catch (error: any) {
                console.error(error)
                return {
                  [FORM_ERROR]: error.toString(),
                }
              }
            }}
          />
        </Suspense>
      </div>
    </>
  )
}
