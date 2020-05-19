import React, {Suspense} from 'react'
import {Head, Link, useRouter, useQuery} from 'blitz'
import get__ModelName__ from 'app/__modelNames__/queries/get__ModelName__'
import update__ModelName__ from 'app/__modelNames__/mutations/update__ModelName__'
import __ModelName__Form from 'app/__modelNames__/components/__ModelName__Form'

export const Edit__ModelName__: React.FC = () => {
  const router = useRouter()
  const __modelId__ = parseInt(router?.query.__modelId__ as string)
  if (process.env.parentModel) {
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
  }
  const [__modelName__] = useQuery(get__ModelName__, {where: {id: __modelId__}})

  return (
    <div>
      <h1>Edit __ModelName__ {__modelName__.id}</h1>
      <pre>{JSON.stringify(__modelName__)}</pre>

      <__ModelName__Form
        initialValues={__modelName__}
        onSubmit={async () => {
          try {
            const updated = await update__ModelName__({
              where: {id: __modelName__.id},
              data: {name: 'MyNewName'},
            })
            alert('Success!' + JSON.stringify(updated))
            router.push(
              process.env.parentModel
                ? '/__parentModels__/__parentModelParam__/__modelNames__/__modelIdParam__'
                : '/__modelNames__/__modelIdParam__',
              process.env.parentModel
                ? `/__parentModels__/${__parentModelId__}/__modelNames__/${updated.id}`
                : `/__modelNames__/${updated.id}`,
            )
          } catch (error) {
            console.log(error)
            alert('Error creating __modelName__ ' + JSON.stringify(error, null, 2))
          }
        }}
      />
    </div>
  )
}

const Edit__ModelName__Page: React.FC = () => {
  if (process.env.parentModel) {
    const router = useRouter()
    const __parentModelId__ = parseInt(router?.query.__parentModelId__ as string)
  }

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

export default Edit__ModelName__Page
