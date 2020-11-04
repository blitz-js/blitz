import React from "react"
import Layout from "app/layouts/Layout"
if (process.env.parentModel) {
  import {Link, useRouter, useMutation, useParam, BlitzPage} from "blitz"
} else {
  import {Link, useRouter, useMutation, BlitzPage} from "blitz"
}
import create__ModelName__ from "app/__modelNamesPath__/mutations/create__ModelName__"
import __ModelName__Form from "app/__modelNamesPath__/components/__ModelName__Form"

const New__ModelName__Page: BlitzPage = () => {
  const router = useRouter()
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }
  const [create__ModelName__Mutation] = useMutation(create__ModelName__)

  return (
    <div>
      <h1>Create New __ModelName__</h1>

      <__ModelName__Form
        initialValues={{}}
        onSubmit={async () => {
          try {
            const __modelName__ = await create__ModelName__Mutation(
              process.env.parentModel
                ? {data: {name: "MyName"}, __parentModelId__}
                : {data: {name: "MyName"}},
            )
            alert("Success!" + JSON.stringify(__modelName__))
            router.push(
              process.env.parentModel
                ? `/__parentModels__/${__parentModelId__}/__modelNames__/${__modelName__.id}`
                : `/__modelNames__/${__modelName__.id}`
            )
          } catch (error) {
            alert("Error creating __modelName__ " + JSON.stringify(error, null, 2))
          }
        }}
      />

      <p>
        <if condition="parentModel">
          <Link href={`/__parentModels__/${__parentModelId__}/__modelNames__`}>
            <a>__ModelNames__</a>
          </Link>
          <else>
            <Link href="/__modelNames__">
              <a>__ModelNames__</a>
            </Link>
          </else>
        </if>
      </p>
    </div>
  )
}

New__ModelName__Page.getLayout = (page) => (
  <Layout title={"Create New __ModelName__"}>{page}</Layout>
)

export default New__ModelName__Page
