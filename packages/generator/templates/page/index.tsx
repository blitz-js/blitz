import {Suspense} from "react"
import {Routes} from '@blitzjs/next'
if (process.env.parentModel) {
  import Head from "next/head"
  import Link from 'next/link'
  import {usePaginatedQuery} from '@blitzjs/rpc'
  import {useParam} from '@blitzjs/next'
  import { useRouter } from "next/router"

} else {
  import Head from "next/head"
  import Link from 'next/link'
  import {usePaginatedQuery} from '@blitzjs/rpc'
  import { useRouter } from "next/router"
}
import Layout from "app/core/layouts/Layout"
import get__ModelNames__ from "app/__modelNamesPath__/queries/get__ModelNames__"

const ITEMS_PER_PAGE = 100

export const __ModelNames__List = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
    const [{__modelNames__, hasMore}] = usePaginatedQuery(get__ModelNames__, {
      where: {__parentModel__: {id: __parentModelId__!}},
      orderBy: {id: "asc"},
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    })

    const goToPreviousPage = () => router.push({query: {page: page - 1}})
    const goToNextPage = () => router.push({query: {page: page + 1}})

    return (
      <div>
        <ul>
          {__modelNames__.map((__modelName__) => (
            <li key={__modelName__.id}>
              <Link href={Routes.Show__ModelName__Page({ __modelId__: __modelName__.id })}>
                <a>{__modelName__.name}</a>
              </Link>
            </li>
          ))}
        </ul>

        <button disabled={page === 0} onClick={goToPreviousPage}>
          Previous
        </button>
        <button disabled={!hasMore} onClick={goToNextPage}>
          Next
        </button>
      </div>
    )
  } else {
    const [{__modelNames__, hasMore}] = usePaginatedQuery(get__ModelNames__, {
      orderBy: {id: "asc"},
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    })

    const goToPreviousPage = () => router.push({query: {page: page - 1}})
    const goToNextPage = () => router.push({query: {page: page + 1}})

    return (
      <div>
        <ul>
          {__modelNames__.map((__modelName__) => (
            <li key={__modelName__.id}>
              <if condition="parentModel">
                <Link href={Routes.Show__ModelName__Page({ __parentModelId__: __parentModelId__!, __modelId__: __modelName__.id })}>
                  <a>{__modelName__.name}</a>
                </Link>               
                <else>
                  <Link href={Routes.Show__ModelName__Page({ __modelId__: __modelName__.id })}>
                    <a>{__modelName__.name}</a>
                  </Link>
                </else>
              </if>
            </li>
          ))}
        </ul>

        <button disabled={page === 0} onClick={goToPreviousPage}>
          Previous
        </button>
        <button disabled={!hasMore} onClick={goToNextPage}>
          Next
        </button>
      </div>
    )
  }
}

const __ModelNames__Page = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }

  return (
    <Layout>
      <Head>
        <title>__ModelNames__</title>
      </Head>

      <div>
        <p>
          <if condition="parentModel">
            <Link href={Routes.New__ModelName__Page({ __parentModelId__: __parentModelId__! })}>
              <a>Create __ModelName__</a>
            </Link>
            <else>
              <Link href={Routes.New__ModelName__Page()}>
                <a>Create __ModelName__</a>
              </Link>
            </else>
          </if>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelNames__List />
        </Suspense>
      </div>
    </Layout>
  )
}


export default __ModelNames__Page
