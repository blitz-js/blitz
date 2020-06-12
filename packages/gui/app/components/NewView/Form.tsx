import {FC} from 'react'

export const Form: FC = () => {
  return (
    <>
      <div className="px-4 py-5 space-y-4 sm:px-6">
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
      </div>
    </>
  )
}
