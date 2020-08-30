import React, {Suspense} from "react"
import Layout from "app/layouts/Layout"
if (process.env.parentModel) {
  import {Head, Link, useQuery, useParam, BlitzPage} from "blitz"
} else {
  import {Head, Link, useQuery, BlitzPage} from "blitz"
}
import get__ModelNames__ from "app/__modelNamesPath__/queries/get__ModelNames__"

export const __ModelNames__List = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
    const [__modelNames__] = useQuery(get__ModelNames__, {
      where: {__parentModel__: {id: __parentModelId__}},
      orderBy: {id: "desc"},
    })

    return (
      <ul>
        {__modelNames__.map((__modelName__) => (
          <li key={__modelName__.id}>
            <Link
              href="/__parentModels__/__parentModelParam__/__modelNames__/__modelIdParam__"
              as={`/__parentModels__/${__parentModelId__}/__modelNames__/${__modelName__.id}`}
            >
              <a>{__modelName__.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    )
  } else {
    const [__modelNames__] = useQuery(get__ModelNames__, {orderBy: {id: "desc"}})

    return (
      <ul>
        {__modelNames__.map((__modelName__) => (
          <li key={__modelName__.id}>
            <Link
              href="/__modelNames__/__modelIdParam__"
              as={`/__modelNames__/${__modelName__.id}`}
            >
              <a>{__modelName__.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    )
  }
}

const __ModelNames__Page: BlitzPage = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }

  return (
    <div>
      <Head>
        <title>__ModelNames__</title>
      </Head>

      <main>
        <h1>__ModelNames__</h1>

        <p>
          <if condition="parentModel">
            <Link
              href="/__parentModels__/__parentModelId__/__modelNames__/new"
              as={`/__parentModels__/${__parentModelId__}/__modelNames__/new`}
            >
              <a>Create __ModelName__</a>
            </Link>
            <else>
              <Link href="/__modelNames__/new">
                <a>Create __ModelName__</a>
              </Link>
            </else>
          </if>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelNames__List />
        </Suspense>
      </main>
    </div>
  )
}

__ModelNames__Page.getLayout = (page) => <Layout title={"__ModelNames__"}>{page}</Layout>

export default __ModelNames__Page
