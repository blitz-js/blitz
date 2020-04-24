import {Suspense} from 'react'
import {Head, Link, useRouter, useQuery} from 'blitz'
import get<%= ModelName %> from 'app/<%= modelNames %>/queries/get<%= ModelName %>'
import update<%= ModelName %> from 'app/<%= modelNames %>/mutations/update<%= ModelName %>'

export const Edit<%= ModelName %> = () => {
  const router = useRouter()
  const id = parseInt(router?.query.id as string)
  const [<%= modelName %>] = useQuery(get<%= ModelName %>, {where: {id}})

  return (
    <div>
      <h1>Edit <%= ModelName %> {<%= modelName %>.id}</h1>
      <pre>
        {JSON.stringify(<%= modelName %>)}
      </pre>

      <form onSubmit={async (event) => {
        event.preventDefault()
        try {
          const updated = await update<%= ModelName %>({
            where: {id: <%= modelName %>.id},
            data: {name: 'MyNewName'},
          })
          alert('Success!' + JSON.stringify(updated))
          router.push('/<%= modelNames %>/[id]', `/<%= modelNames %>/${updated.id}`)
        } catch (error) {
          alert('Error creating <%= modelName %> ' + JSON.stringify(error, null, 2))
        }
      }}>
        <div>Put your form fields here</div>
        <button>Submit</button>
      </form>
    </div>
  )
}

const Edit<%= ModelName %>Page = () => {
  return (
    <div className="container">
      <Head>
        <title>Edit <%= ModelName %></title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Edit<%= ModelName %> />
        </Suspense>

        <p>
          <Link href="/<%= modelNames %>">
            <a><%= ModelNames %></a>
          </Link>
        </p>
      </main>
    </div>
  )
}

export default Edit<%= ModelName %>Page

