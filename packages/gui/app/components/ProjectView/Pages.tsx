import {useParam, useQuery} from 'blitz'
import {Terminal} from 'heroicons-react'
import {FC} from 'react'

import getPages from 'app/queries/getPages'
import getProject from 'app/queries/getProject'

export const Pages: FC = () => {
  const id = useParam('id', 'string')

  const [project] = useQuery(getProject, {where: {id}})

  if (!project) {
    return null
  }

  const [pages] = useQuery(getPages, {path: project.path})

  return (
    <div className="overflow-hidden bg-white border-t border-b border-gray-200 sm:border sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 divide-y divide-gray-200 sm:px-6">
        <h3 className="text-lg font-medium leading-6">Pages</h3>
      </div>
      <ul>
        {pages.map((page, i) => (
          <li key={`${page.route}-${i}`}>
            <a
              href="#"
              className="block transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:bg-gray-50">
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div>
                      <div className="text-sm font-medium leading-5 truncate">{page.link}</div>
                      <div className="flex items-center mt-2 text-sm leading-5 text-gray-500">
                        <Terminal className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span className="truncate">{page.route}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
