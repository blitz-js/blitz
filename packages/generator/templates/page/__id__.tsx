import {Suspense} from 'react'
import {Head, Link, useRouter, useQuery} from 'blitz'
import get__ModelName__ from 'app/__modelNames__/queries/get__ModelName__'
import delete__ModelName__ from 'app/__modelNames__/mutations/delete__ModelName__'

export const __ModelName__ = () => {
  const router = useRouter()
  const id = parseInt(router?.query.id as string)
  const [__modelName__] = useQuery(get__ModelName__, {where: {id}})

  return (
    <div>
      <h1>__ModelName__ {__modelName__.id}</h1>
      <pre>{JSON.stringify(__modelName__)}</pre>

      <Link href="/__modelNames__/[id]/edit" as={`/__modelNames__/${__modelName__.id}/edit`}>
        <a>Edit</a>
      </Link>

      <button
        type="button"
        onClick={async () => {
          if (window.confirm('This will be deleted')) {
            await delete__ModelName__({where: {id: __modelName__.id}})
            router.push('/__modelNames__')
          }
        }}>
        Delete
      </button>
    </div>
  )
}

const Show__ModelName__Page = () => {
  return (
    <div>
      <Head>
        <title>__ModelName__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          <Link href="/__modelNames__">
            <a>__ModelNames__</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelName__ />
        </Suspense>
      </main>
    </div>
  )
}

export default Show__ModelName__Page
