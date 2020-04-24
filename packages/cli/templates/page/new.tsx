import {Head, Link, useRouter} from 'blitz'
import create<%= ModelName %> from 'app/<%= modelNames %>/mutations/create<%= ModelName %>'

const New<%= ModelName %>Page = () => {
  const router = useRouter()
  return (
    <div className="container">
      <Head>
        <title>New <%= ModelName %></title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Create New <%= ModelName %> </h1>

        <form onSubmit={async (event) => {
          event.preventDefault()
          try {
            const <%= modelName %> = await create<%= ModelName %>({data: {name: 'MyName'}})
            alert('Success!' + JSON.stringify(<%= modelName %>))
            router.push('/<%= modelNames %>/[id]', `/<%= modelNames %>/${<%= modelName %>.id}`)
          } catch (error) {
            alert('Error creating <%= modelName %> ' + JSON.stringify(error, null, 2))
          }
        }}>
          <div>Put your form fields here</div>
          <button>Submit</button>
        </form>

        <p>
          <Link href="/<%= modelNames %>">
            <a><%= ModelNames %></a>
          </Link>
        </p>
      </main>
    </div>
  )
}

export default New<%= ModelName %>Page

