import {Suspense} from 'react'
import {Head, Link, useQuery} from 'blitz'
import get<%= ModelNames %> from 'app/<%= modelNames %>/queries/get<%= ModelNames %>'

export const <%= ModelNames %>List = () => {
  const [<%= modelNames %>] = useQuery(get<%= ModelNames %>)

  return (
    <ul>
      {<%= modelNames %>.map((<%= modelName %>) => (
        <li key={<%= modelName %>.id}>
          <Link href="/<%= modelNames %>/[id]" as={`/<%= modelNames %>/${<%= modelName %>.id}`}>
            <a>{<%= modelName %>.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const <%= ModelNames %>Page = () => {
  return (
    <div className="container">
      <Head>
        <title><%= ModelNames %></title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1><%= ModelNames %></h1>

        <p>
          <Link href="/<%= modelNames %>/new">
            <a>Create <%= ModelName %></a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <<%= ModelNames %>List />
        </Suspense>
      </main>
    </div>
  )
}

export default <%= ModelNames %>Page



