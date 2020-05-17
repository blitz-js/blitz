import {Suspense} from 'react'
import {Head, Link, useRouter, useQuery} from 'blitz'
import get__ModelName__ from 'app/__modelNames__/queries/get__ModelName__'
import update__ModelName__ from 'app/__modelNames__/mutations/update__ModelName__'

export const Edit__ModelName__ = () => {
  const router = useRouter()
  const id = parseInt(router?.query.id as string)
  if (process.env.parentModel) {
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
  }
  const [__modelName__] = useQuery(get__ModelName__, {where: {id}})

  return (
    <div>
      <h1>Edit __ModelName__ {__modelName__.id}</h1>
      <pre>{JSON.stringify(__modelName__)}</pre>

      <form
        onSubmit={async (event) => {
          event.preventDefault()
          try {
            const updated = await update__ModelName__({
              where: {id: __modelName__.id},
              data: {name: 'MyNewName'},
            })
            alert('Success!' + JSON.stringify(updated))
            router.push(
              process.env.parentModel
                ? '/__parentModels__/__parentModelParam__/__modelNames__/[id]'
                : '/__modelNames__/[id]',
              process.env.parentModel
                ? `/__parentModels__/${__parentModelId__}/__modelNames__/${updated.id}`
                : `/__modelNames__/${updated.id}`
            )
          } catch (error) {
            console.log(error)
            alert('Error creating __modelName__ ' + JSON.stringify(error, null, 2))
          }
        }}>
        <div>Put your form fields here. But for now, just click submit</div>
        <button>Submit</button>
      </form>
    </div>
  )
}

const Edit__ModelName__Page = () => {
  const router = useRouter()
  if (process.env.parentModel) {
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
  }

  const indexLink = process.env.parentModel
    ? (
      <Link href={`/__parentModels__/${__parentModelId__}/__modelNames__`}>
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
        <title>Edit __ModelName__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Edit__ModelName__ />
        </Suspense>

        <p>
          {indexLink}
        </p>
      </main>
    </div>
  )
}

export default Edit__ModelName__Page
