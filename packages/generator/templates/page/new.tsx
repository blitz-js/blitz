import {Head, Link, useRouter} from 'blitz'
import create__ModelName__ from 'app/__modelNames__/mutations/create__ModelName__'

const New__ModelName__Page = () => {
  const router = useRouter()
  if (process.env.parentModel) {
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
  }

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
                ? {data: {name: 'MyName', __parentModel__: {connect: {id: __parentModelId__}}}}
                : {data: {name: 'MyName'}}
              const __modelName__ = await create__ModelName__(createArgs)
              alert('Success!' + JSON.stringify(__modelName__))
              router.push(
                process.env.parentModel
                  ? '/__parentModels__/__parentModelParam__/__modelNames__/__modelIdParam__'
                  : '/__modelNames__/__modelIdParam__',
                process.env.parentModel
                  ? `/__parentModels__/${__parentModelId__}/__modelNames__/${__modelName__.id}`
                  : `/__modelNames__/${__modelName__.id}`,
              )
            } catch (error) {
              alert('Error creating __modelName__ ' + JSON.stringify(error, null, 2))
            }
          }}>
          <div>Put your form fields here. But for now, just click submit</div>
          <button>Submit</button>
        </form>

        <p>
          {process.env.parentModel ? (
            <Link
              as="/__parentModels__/__parentModelId__/__modelNames__"
              href={`/__parentModels__/${__parentModelId__}/__modelNames__`}>
              <a>__ModelNames__</a>
            </Link>
          ) : (
            <Link href="/__modelNames__">
              <a>__ModelNames__</a>
            </Link>
          )}
        </p>
      </main>
    </div>
  )
}

export default New__ModelName__Page
