import {Head, Link, useRouter} from 'blitz'
import create__ModelName__ from 'app/__modelNames__/mutations/create__ModelName__'

const New__ModelName__Page = () => {
  const router = useRouter()
  return (
    <div className="container">
      <Head>
        <title>New __ModelName__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Create New __ModelName__ </h1>

        <form onSubmit={async (event) => {
          event.preventDefault()
          try {
            const __modelName__ = await create__ModelName__({data: {name: 'MyName'}})
            alert('Success!' + JSON.stringify(__modelName__))
            router.push('/__modelNames__/[id]', `/__modelNames__/${__modelName__.id}`)
          } catch (error) {
            alert('Error creating __modelName__ ' + JSON.stringify(error, null, 2))
          }
        }}>
          <div>Put your form fields here. But for now, just click submit</div>
          <button>Submit</button>
        </form>

        <p>
          <Link href="/__modelNames__">
            <a>__ModelNames__</a>
          </Link>
        </p>
      </main>
    </div>
  )
}

export default New__ModelName__Page

