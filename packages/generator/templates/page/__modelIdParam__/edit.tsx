import {Suspense} from "react"
import Layout from "app/layouts/Layout"
import {Link, useRouter, useQuery, useMutation, useParam, BlitzPage} from "blitz"
import get__ModelName__ from "app/__modelNamesPath__/queries/get__ModelName__"
import update__ModelName__ from "app/__modelNamesPath__/mutations/update__ModelName__"
import __ModelName__Form from "app/__modelNamesPath__/components/__ModelName__Form"

export const Edit__ModelName__ = () => {
  const router = useRouter()
  const __modelId__ = useParam("__modelId__", "number")
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }
  const [__modelName__, {setQueryData}] = useQuery(get__ModelName__, {where: {id: __modelId__}})
  const [update__ModelName__Mutation] = useMutation(update__ModelName__)

  return (
    <div>
      <h1>Edit __ModelName__ {__modelName__.id}</h1>
      <pre>{JSON.stringify(__modelName__)}</pre>

      <__ModelName__Form
        initialValues={__modelName__}
        onSubmit={async () => {
          try {
            const updated = await update__ModelName__Mutation({
              where: {id: __modelName__.id},
              data: {name: "MyNewName"},
            })
            await setQueryData(updated)
            alert("Success!" + JSON.stringify(updated))
            router.push(
              process.env.parentModel
                ? `/__parentModels__/${__parentModelId__}/__modelNames__/${updated.id}`
                : `/__modelNames__/${updated.id}`
            )
          } catch (error) {
            console.log(error)
            alert("Error creating __modelName__ " + JSON.stringify(error, null, 2))
          }
        }}
      />
    </div>
  )
}

const Edit__ModelName__Page: BlitzPage = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Edit__ModelName__ />
      </Suspense>

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

Edit__ModelName__Page.getLayout = (page) => <Layout title={"Edit __ModelName__"}>{page}</Layout>

export default Edit__ModelName__Page
