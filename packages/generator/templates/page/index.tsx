import React, {Suspense} from 'react'
if (process.env.parentModel) {
  import {Head, Link, useQuery, useParam} from 'blitz'
} else {
  import {Head, Link, useQuery} from 'blitz'
}
import get__ModelNames__ from 'app/__importModelNames__/queries/get__ModelNames__'

export const __ModelNames__List: React.FC = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number')
    const [__modelNames__] = useQuery(get__ModelNames__, {
      where: {__parentModel__: {id: __parentModelId__}},
      orderBy: {id: 'desc'},
    })

    return (
      <ul>
        {__modelNames__.map((__modelName__) => (
          <li key={__modelName__.id}>
            <Link
              href="/__parentModels__/__parentModelParam__/__modelNames__/__modelIdParam__"
              as={`/__parentModels__/${__parentModelId__}/__modelNames__/${__modelName__.id}`}>
              <a>{__modelName__.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    )
  } else {
    const [__modelNames__] = useQuery(get__ModelNames__, {orderBy: {id: 'desc'}})

    return (
      <ul>
        {__modelNames__.map((__modelName__) => (
          <li key={__modelName__.id}>
            <Link href="/__modelNames__/__modelIdParam__" as={`/__modelNames__/${__modelName__.id}`}>
              <a>{__modelName__.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    )
  }
}

const __ModelNames__Page: React.FC = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number')
  }

  return (
    <div>
      <Head>
        <title>__ModelNames__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>__ModelNames__</h1>

        <p>
          {process.env.parentModel ? (
            <Link
              href="/__parentModels__/__parentModelId__/__modelNames__/new"
              as={`/__parentModels__/${__parentModelId__}/__modelNames__/new`}>
              <a>Create __ModelName__</a>
            </Link>
          ) : (
            <Link href="/__modelNames__/new">
              <a>Create __ModelName__</a>
            </Link>
          )}
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelNames__List />
        </Suspense>
      </main>
    </div>
  )
}

export default __ModelNames__Page
