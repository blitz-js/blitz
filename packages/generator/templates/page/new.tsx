if (process.env.parentModel) {
  import {Link, useRouter, useMutation, useParam, BlitzPage, Routes} from "blitz"
} else {
  import {Link, useRouter, useMutation, BlitzPage, Routes} from "blitz"
}
import Layout from "app/core/layouts/Layout"
import create__ModelName__ from "app/__modelNamesPath__/mutations/create__ModelName__"
import {__ModelName__Form, FORM_ERROR} from "app/__modelNamesPath__/components/__ModelName__Form"

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
        submitText="Create __ModelName__"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={Create__ModelName__}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const __modelName__ = await create__ModelName__Mutation(
              process.env.parentModel
                ? {...values, __parentModelId__: __parentModelId__!}
                : values,
            )
            router.push(
              process.env.parentModel
                ? Routes.Show__ModelName__Page({ __parentModelId__: __parentModelId__!, __modelId__: __modelName__.id })
                : Routes.Show__ModelName__Page({ __modelId__: __modelName__.id }),
            )
          } catch (error) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <if condition="parentModel">
          <Link href={Routes.__ModelNames__Page({ __parentModelId__: __parentModelId__! })}>
            <a>__ModelNames__</a>
          </Link>
          <else>
            <Link href={Routes.__ModelNames__Page()}>
              <a>__ModelNames__</a>
            </Link>
          </else>
        </if>
      </p>
    </div>
  )
}

New__ModelName__Page.authenticate = true
New__ModelName__Page.getLayout = (page) => (
  <Layout title={"Create New __ModelName__"}>{page}</Layout>
)

export default New__ModelName__Page
