import {Link, useParam, useQuery} from 'blitz'
import {BanOutline, PlayOutline, PuzzleOutline} from 'heroicons-react'
import {FC} from 'react'

import getProject from 'app/queries/getProject'
import getSchema from 'app/queries/getSchema'

export const Schema: FC = () => {
  const id = useParam('id', 'string')

  const [project] = useQuery(getProject, {where: {id}})

  if (!project) {
    return null
  }

  // eslint-disable-next-line
  const [schema] = useQuery(getSchema, {path: project.path})

  return (
    <div className="overflow-hidden bg-white border-t border-b border-gray-200 sm:border sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 divide-y divide-gray-200 sm:px-6">
        <h3 className="text-lg font-medium leading-6">Schema</h3>
      </div>
      {!schema && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-indigo-100 rounded-full">
            <BanOutline className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium leading-6">Schema not found!</h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                It doesn’t look like you have any Prisma schema at{' '}
                <code className="px-1 text-xs bg-gray-200">db/prisma.schema</code>
              </p>
            </div>
          </div>
        </div>
      )}
      {schema && Object.keys(schema.models).length === 0 && (
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-indigo-100 rounded-full">
            <PuzzleOutline className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium leading-6">Couldn’t read schema!</h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                It looks like you have a Prisma schema at{' '}
                <code className="px-1 text-xs bg-gray-200">db/prisma.schema</code>, but we couldn’t read it.
                Try creating some models first!
              </p>
            </div>
          </div>
        </div>
      )}
      {schema && schema.models && Object.keys(schema.models).length > 0 && (
        <div className="p-6">
          <Link href="/p/[id]/schema" as={`/p/${id}/schema`}>
            <a
              href="#"
              className="flex items-center p-3 space-x-3 text-base font-medium leading-6 text-gray-900 transition duration-150 ease-in-out rounded-md hover:bg-gray-100">
              <PlayOutline className="flex-shrink-0 w-6 h-6 text-gray-400" />
              <span>View Schema</span>
            </a>
          </Link>
        </div>
      )}
    </div>
  )
}
