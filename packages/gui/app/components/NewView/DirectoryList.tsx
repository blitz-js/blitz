import {useQuery} from 'blitz'
import {Folder} from 'heroicons-react'
import {FC} from 'react'

import getDirectories from 'app/queries/getDirectories'
import {DirectoryListProps} from './types'

export const DirectoryList: FC<DirectoryListProps> = ({path, setPath}) => {
  const [directories] = useQuery(getDirectories, {path})

  return (
    <ul className="divide-y divide-gray-200 ">
      {directories.map((directory) => (
        <li key={directory.path}>
          <button
            onClick={() => setPath(directory.path)}
            type="button"
            className="block w-full text-left transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:bg-gray-50">
            <div className="flex items-center py-3 pl-3 pr-4 text-sm leading-5">
              {directory.isBlitz ? (
                <img
                  className="flex-shrink-0 w-5 h-5 text-gray-400"
                  src="/img/logos/blitz-mark-on-white.svg"
                  alt=""
                />
              ) : (
                <Folder className="flex-shrink-0 w-5 h-5 text-gray-400" />
              )}
              <span className="flex-1 w-0 ml-2 truncate">{directory.name}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
