import {Suspense} from "react"
import {Routes} from '@blitzjs/next'
import Head from "next/head"
import Link from 'next/link'
import { useRouter } from "next/router"
import {useQuery, useMutation} from '@blitzjs/rpc'
import {useParam} from '@blitzjs/next'

import Layout from "app/core/layouts/Layout"
import get__ModelName__ from "app/__modelNamesPath__/queries/get__ModelName__"
import delete__ModelName__ from "app/__modelNamesPath__/mutations/delete__ModelName__"

export const __ModelName__ = () => {
  const router = useRouter()
  const __modelId__ = useParam("__modelId__", "number")
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }
  const [delete__ModelName__Mutation] = useMutation(delete__ModelName__)
  const [__modelName__] = useQuery(get__ModelName__, {id: __modelId__} )

  return (
    <>
      <Head>
        <title>__ModelName__ {__modelName__.id}</title>
      </Head>

      <div>
        <h1>__ModelName__ {__modelName__.id}</h1>
        <pre>{JSON.stringify(__modelName__, null, 2)}</pre>

        <if condition="parentModel">
          <Link href={Routes.Edit__ModelName__Page({ __parentModelId__: __parentModelId__!, __modelId__: __modelName__.id })}>
            <a>Edit</a>
          </Link>
          <else>
            <Link href={Routes.Edit__ModelName__Page({ __modelId__: __modelName__.id })}>
              <a>Edit</a>
            </Link>
          </else>
        </if>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await delete__ModelName__Mutation({id: __modelName__.id})
              if (process.env.parentModel) {
                await router.push(Routes.__ModelNames__Page({ __parentModelId__: __parentModelId__! }))
              } else {
                await router.push(Routes.__ModelNames__Page())
              }
            }
          }}
          style={{marginLeft: "0.5rem"}}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const Show__ModelName__Page = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }

  return (
    <div>
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

      <Suspense fallback={<div>Loading...</div>}>
        <__ModelName__ />
      </Suspense>
    </div>
  )
}

Show__ModelName__Page.authenticate = true
Show__ModelName__Page.getLayout = (page) => <Layout>{page}</Layout>

export default Show__ModelName__Page
