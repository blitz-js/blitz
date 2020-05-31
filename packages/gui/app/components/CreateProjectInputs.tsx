import {Dispatch, FC, SetStateAction} from 'react'
import {PlusCircleOutline} from 'heroicons-react'

import {toKebabCase} from 'utils/toKebabCase'

type CreateProjectInputsProps = {
  name: string
  setName: Dispatch<SetStateAction<string>>
  description: string
  setDescription: Dispatch<SetStateAction<string>>
  homedir: string
  path: string
  setPath: Dispatch<SetStateAction<string>>
}

export const CreateProjectInputs: FC<CreateProjectInputsProps> = ({
  name,
  setName,
  description,
  setDescription,
  homedir,
  path,
  setPath,
}) => (
  <div className="sm:flex sm:items-start">
    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-indigo-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
      <PlusCircleOutline className="w-6 h-6 text-indigo-600" />
    </div>
    <div className="mt-3 text-center sm:w-3/4 sm:mt-0 sm:ml-4 sm:text-left">
      <h3 className="text-lg font-medium leading-6" id="modal-headline">
        Create Project
      </h3>
      <div className="mt-2">
        <p className="text-sm leading-5 text-gray-500">Fill out the information below to get started.</p>
      </div>
      <div className="mt-6 sm:mt-4">
        <label htmlFor="name" className="block text-sm font-medium leading-5 text-left text-gray-700">
          Name
        </label>
        <div className="mt-1 rounded-md shadow-sm">
          <input
            autoFocus
            id="name"
            className="block w-full form-input sm:text-sm sm:leading-5"
            placeholder="my-awesome-project"
            value={name}
            onChange={(e) => setName(toKebabCase(e.target.value))}
          />
        </div>

        <label
          htmlFor="description"
          className="block mt-4 text-sm font-medium leading-5 text-left text-gray-700">
          Description
        </label>
        <div className="mt-1 rounded-md shadow-sm">
          <textarea
            id="description"
            className="block w-full form-textarea sm:text-sm sm:leading-5"
            placeholder="What do you plan to build this project for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <label htmlFor="path" className="block mt-4 text-sm font-medium leading-5 text-left text-gray-700">
          Path
        </label>
        <div className="flex w-full max-w-sm mt-1 rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 text-gray-500 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 sm:text-sm">
            {homedir}/
          </span>
          <input
            id="path"
            className="flex-1 block w-full rounded-none form-input sm:text-sm sm:leading-5 rounded-r-md"
            placeholder="/User/Dylan"
            value={path}
            onChange={(e) => setPath(toKebabCase(e.target.value))}
          />
        </div>
      </div>
    </div>
  </div>
)
