import React from 'react'
import {Head, Link, useRouter, useParam} from 'blitz'
import create__ModelName__ from 'app/__importModelNames__/mutations/create__ModelName__'
import __ModelName__Form from 'app/__importModelNames__/components/__ModelName__Form'

const New__ModelName__Page: React.FC = () => {
  const router = useRouter()
  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number')
  }

  return (
    <div>
      <Head>
        <title>New __ModelName__</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Create New __ModelName__ </h1>

        <__ModelName__Form
          initialValues={{}}
          onSubmit={async () => {
            try {
              const __modelName__ = await create__ModelName__(
                process.env.parentModel
                  ? {data: {name: 'MyName'}, __parentModelId__}
                  : {data: {name: 'MyName'}},
              )
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
          }}
        />

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
