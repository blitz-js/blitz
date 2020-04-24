import {Suspense} from 'react'
import {Head, Link, useRouter, useQuery} from 'blitz'
import get<%= ModelName %> from 'app/<%= modelNames %>/queries/get<%= ModelName %>'
import delete<%= ModelName %> from 'app/<%= modelNames %>/mutations/delete<%= ModelName %>'


export const <%= ModelName %> = () => {
  const router = useRouter()
  const id = parseInt(router?.query.id as string)
  const [<%= modelName %>] = useQuery(get<%= ModelName %>, {where: {id}})

  return (
    <div>
      <h1><%= ModelName %> {<%= modelName %>.id}</h1>
      <pre>
        {JSON.stringify(<%= modelName %>)}
      </pre>

      <Link href="/<%= modelNames %>/[id]/edit" as={`/<%= modelNames %>/${<%= modelName %>.id}/edit`}>
        <a>Edit</a>
      </Link>

        <button type="button" onClick={async () => {
          if (confirm("This will be deleted")) {
            await delete<%= ModelName %>({where: {id: <%= modelName %>.id}})
            router.push('/<%= modelNames %>')
          }
        }}>
        Delete
      </button>
    </div>
  )
}

const Show<%= ModelName %>Page = () => {
  return (
    <div className="container">
      <Head>
        <title><%= ModelName %></title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          <Link href="/<%= modelNames %>">
            <a><%= ModelNames %></a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <<%= ModelName %> />
        </Suspense>
      </main>
    </div>
  )
}

export default Show<%= ModelName %>Page

