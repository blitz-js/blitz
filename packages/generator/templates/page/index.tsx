import {Suspense} from 'react'
if (process.env.parentModel) {
import {Head, Link, useRouter, useQuery} from 'blitz'
} else {
import {Head, Link, useQuery} from 'blitz'
}
import get__ModelNames__ from 'app/__modelNames__/queries/get__ModelNames__'

export const __ModelNames__List = () => {
  if (process.env.parentModel) {
    const router = useRouter()
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
    const [__modelNames__] = useQuery(get__ModelNames__, {where: {__ParentModel__: {id: __parentModelId__}}})

    return (
      <ul>
        {__modelNames__.map((__modelName__) => (
          <li key={__modelName__.id}>
            <Link
              href="/__parentModels__/__parentModelParam__/__modelNames__/[id]"
              as={`/__parentModels__/${__parentModelId__}/__modelNames__/${__modelName__.id}`}
            >
              <a>{__modelName__.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    )
  } else {
    const [__modelNames__] = useQuery(get__ModelNames__)

    return (
      <ul>
        {__modelNames__.map((__modelName__) => (
          <li key={__modelName__.id}>
            <Link href="/__modelNames__/[id]" as={`/__modelNames__/${__modelName__.id}`}>
              <a>{__modelName__.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    )
  }
}


const __ModelNames__Page = () => {
  if (process.env.parentModel) {
    const router = useRouter()
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
  }

  const createLink = process.env.parentModel
    ? (
      <Link href={`/__parentModels__/${__parentModelId__}/__modelNames__/new`}>
        <a>Create __ModelName__</a>
      </Link>
    )
    : (
      <Link href="/__modelNames__/new">
        <a>Create __ModelName__</a>
      </Link>
    )

  return (
    <div>
      <Head>
        <title>__ModelNames__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>__ModelNames__</h1>

        <p>
          {createLink}
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelNames__List />
        </Suspense>
      </main>
    </div>
  )
}

export default __ModelNames__Page
