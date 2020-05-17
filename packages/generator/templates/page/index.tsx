import {Suspense} from 'react'
import {Head, Link, useQuery} from 'blitz'
import get__ModelNames__ from 'app/__modelNames__/queries/get__ModelNames__'

export const __ModelNames__List = () => {
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

const __ModelNames__Page = () => {
  return (
    <div>
      <Head>
        <title>__ModelNames__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>__ModelNames__</h1>

        <p>
          <Link href="/__modelNames__/new">
            <a>Create __ModelName__</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelNames__List />
        </Suspense>
      </main>
    </div>
  )
}

export default __ModelNames__Page
