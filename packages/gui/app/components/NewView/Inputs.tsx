import {FC} from 'react'

import {useLocalStorage} from 'utils/hooks/web/useLocalStorage'

export const Inputs: FC = () => {
  const [path, setPath] = useLocalStorage<string>('path', '')

  return (
    <>
      <div className="px-4 py-5 space-y-6 sm:px-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
            Name
          </label>
          <div className="mt-1 rounded-md shadow-sm ">
            <input
              id="name"
              className="block w-full form-input sm:text-sm sm:leading-5"
              placeholder="my-awesome-project"
            />
          </div>
        </div>
        <div>
          <label htmlFor="path" className="block text-sm font-medium leading-5 text-gray-700">
            Path
          </label>
          <div className="mt-1 rounded-md shadow-sm ">
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              id="path"
              className="block w-full form-input sm:text-sm sm:leading-5"
              placeholder="my-awesome-project"
            />
          </div>
        </div>
      </div>
    </>
  )
}
