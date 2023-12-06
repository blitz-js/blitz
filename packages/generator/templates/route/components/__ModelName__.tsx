"use client"
import { useMutation, useQuery } from "@blitzjs/rpc"
import Link from "next/link"
import { useRouter } from "next/navigation"
import delete__ModelName__ from "../mutations/delete__ModelName__"
import get__ModelName__ from "../queries/get__ModelName__"

export const __ModelName__ = ({ __modelId__ }: { __modelId__: number }) => {
  const router = useRouter()
  const [delete__ModelName__Mutation] = useMutation(delete__ModelName__)
  const [__modelName__] = useQuery(get__ModelName__, { id: __modelId__ })

  return (
    <>
      <div>
        <h1>Project {__modelName__.id}</h1>
        <pre>{JSON.stringify(__modelName__, null, 2)}</pre>

        <Link href={`/__modelNames__/${__modelName__.id}/edit`}>Edit</Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await delete__ModelName__Mutation({ id: __modelName__.id })
              router.push("/__modelNames__")
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}
