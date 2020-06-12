import React, {Suspense} from 'react'
import {Head, Link, useRouter, useQuery, useParam} from 'blitz'
import get__ModelName__ from 'app/__importModelNames__/queries/get__ModelName__'
import delete__ModelName__ from 'app/__importModelNames__/mutations/delete__ModelName__'

export const __ModelName__: React.FC = () => {
  const router = useRouter()
  const __modelId__ = useParam('__modelId__', 'number')
  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number')
  }
  const [__modelName__] = useQuery(get__ModelName__, {where: {id: __modelId__}})

  return (
    <div>
      <h1>__ModelName__ {__modelName__.id}</h1>
      <pre>{JSON.stringify(__modelName__, null, 2)}</pre>

      {process.env.parentModel ? (
        <Link
          href="/__parentModels__/__parentModelParam__/__modelNames__/__modelIdParam__/edit"
          as={`/__parentModels__/${__parentModelId__}/__modelNames__/${__modelName__.id}/edit`}>
          <a>Edit</a>
        </Link>
      ) : (
        <Link href="/__modelNames__/__modelIdParam__/edit" as={`/__modelNames__/${__modelName__.id}/edit`}>
          <a>Edit</a>
        </Link>
      )}

      <button
        type="button"
        onClick={async () => {
          if (window.confirm('This will be deleted')) {
            await delete__ModelName__({where: {id: __modelName__.id}})
            if (process.env.parentModel) {
              router.push(
                '/__parentModels__/__parentModelParam__/__modelNames__',
                `/__parentModels__/${__parentModelId__}/__modelNames__`,
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

const Show__ModelName__Page: React.FC = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number')
  }

  return (
    <div>
      <Head>
        <title>__ModelName__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          {process.env.parentModel ? (
            <Link
              href="/__parentModels__/__parentModelId__/__modelNames__"
              as={`/__parentModels__/${__parentModelId__}/__modelNames__`}>
              <a>__ModelNames__</a>
            </Link>
          ) : (
            <Link href="/__modelNames__">
              <a>__ModelNames__</a>
            </Link>
          )}
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelName__ />
        </Suspense>
      </main>
    </div>
  )
}

export default Show__ModelName__Page
