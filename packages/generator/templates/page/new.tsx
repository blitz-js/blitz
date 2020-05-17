import {Head, Link, useRouter} from 'blitz'
import create__ModelName__ from 'app/__modelNames__/mutations/create__ModelName__'

const New__ModelName__Page = () => {
  const router = useRouter()
  if (process.env.parentModel) {
    const parentId = parseInt(router?.query.__parentModelId__ as string)
  }

  const indexLink = process.env.parentModel
    ? (
      <Link href={`/__parentModels__/${parentId}/__modelNames__`}>
        <a>__ModelNames__</a>
      </Link>
    )
    : (
      <Link href="/__modelNames__">
        <a>__ModelNames__</a>
      </Link>
    )

  return (
    <div>
      <Head>
        <title>New __ModelName__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Create New __ModelName__ </h1>

        <form
          onSubmit={async (event) => {
            event.preventDefault()
            try {
              const createArgs = process.env.parentModel
                ? {data: {name: 'MyName', __ParentModel__: {connect: {id: parentId}}}}
                : {data: {name: 'MyName'}}
              const __modelName__ = await create__ModelName__(createArgs)
              alert('Success!' + JSON.stringify(__modelName__))
              router.push(
                process.env.parentModel
                  ? '/__parentModels__/__parentModelParam__/__modelNames__/[id]'
                  : '/__modelNames__/[id]',
                process.env.parentModel
                  ? `/__parentModels__/${parentId}/__modelNames__/${__modelName__.id}`
                  : `/__modelNames__/${__modelName__.id}`)
            } catch (error) {
              alert('Error creating __modelName__ ' + JSON.stringify(error, null, 2))
            }
          }}>
          <div>Put your form fields here. But for now, just click submit</div>
          <button>Submit</button>
        </form>

        <p>
          {indexLink}
        </p>
      </main>
    </div>
  )
}

export default New__ModelName__Page
