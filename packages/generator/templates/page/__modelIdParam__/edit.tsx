import {Suspense} from "react"
import {Head, Link, useAuthorize, useRouter, useQuery, useMutation, useParam, BlitzPage} from "blitz"
import Layout from "app/core/layouts/Layout"
import get__ModelName__ from "app/__modelNamesPath__/queries/get__ModelName__"
import update__ModelName__ from "app/__modelNamesPath__/mutations/update__ModelName__"
import {__ModelName__Form, FORM_ERROR} from "app/__modelNamesPath__/components/__ModelName__Form"

export const Edit__ModelName__ = () => {
  const router = useRouter()
  const __modelId__ = useParam("__modelId__", "number")
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }
  const [__modelName__, {setQueryData}] = useQuery(get__ModelName__, {id: __modelId__})
  const [update__ModelName__Mutation] = useMutation(update__ModelName__)

  return (
    <>
      <Head>
        <title>Edit __ModelName__ {__modelName__.id}</title>
      </Head>

      <div>
        <h1>Edit __ModelName__ {__modelName__.id}</h1>
        <pre>{JSON.stringify(__modelName__)}</pre>

        <__ModelName__Form
          submitText="Update __ModelName__"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={Update__ModelName__}
          initialValues={__modelName__}
          onSubmit={async (values) => {
            try {
              const updated = await update__ModelName__Mutation({
                id: __modelName__.id,
                ...values
              })
              await setQueryData(updated)
              router.push(
                process.env.parentModel
                  ? `/__parentModels__/${__parentModelId__}/__modelNames__/${updated.id}`
                  : `/__modelNames__/${updated.id}`,
              )
            } catch (error) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </div>
    </>
  )
}

const Edit__ModelName__Page: BlitzPage = () => {
  useAuthorize()
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

Edit__ModelName__Page.getLayout = (page) => <Layout>{page}</Layout>

export default Edit__ModelName__Page
