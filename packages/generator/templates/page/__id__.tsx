import {Suspense} from 'react'
import {Head, Link, useRouter, useQuery} from 'blitz'
import get__ModelName__ from 'app/__modelNames__/queries/get__ModelName__'
import delete__ModelName__ from 'app/__modelNames__/mutations/delete__ModelName__'

export const __ModelName__ = () => {
  const router = useRouter()
  const id = parseInt(router?.query.id as string)
  if (process.env.parentModel) {
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
  }
  const [__modelName__] = useQuery(get__ModelName__, {where: {id}})

  const editLink = process.env.parentModel
    ? (
      <Link
        href="/__parentModels__/__parentModelParam__/__modelNames__/[id]/edit"
        as={`/__parentModels__/${__parentModelId__}/__modelNames__/${__modelName__.id}/edit`}
      >
        <a>Edit</a>
      </Link>
    )
    : (
      <Link href="/__modelNames__/[id]/edit" as={`/__modelNames__/${__modelName__.id}/edit`}>
        <a>Edit</a>
      </Link>
    )

  return (
    <div>
      <h1>__ModelName__ {__modelName__.id}</h1>
      <pre>{JSON.stringify(__modelName__)}</pre>

      {editLink}

      <button
        type="button"
        onClick={async () => {
          if (window.confirm('This will be deleted')) {
            await delete__ModelName__({where: {id: __modelName__.id}})
            if (process.env.parentModel) {
              router.push(
                '/__parentModels__/__parentModelParam__/__modelNames__',
                `/__parentModels__/${__parentModelId__}/__modelNames__`
              )
            } else {
              router.push('/__modelNames__')
            }
          }
        }}>
        Delete
      </button>
    </div>
  )
}

const Show__ModelName__Page = () => {
  if (process.env.parentModel) {
    const router = useRouter()
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
  }

  const indexLink = process.env.parentModel
    ? (
      <Link href={`/__parentModels__/${__parentModelId__}/__modelNames__`}>
        <a>__ModelNames__</a>
      </Link>
    )
    : (
      <Link href="/__modelNames__">
        <a>__ModelNames__</a>
      </Link>
    )

  return (
    <div>
      <Head>
        <title>__ModelName__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          {indexLink}
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelName__ />
        </Suspense>
      </main>
    </div>
  )
}

export default Show__ModelName__Page
