import {useQuery} from "blitz"
import {FC} from "react"
import {mutate} from "swr"

import getHomedir from "app/queries/getHomedir"
import {toKebabCase} from "utils/string/toKebabCase"
import {useName} from "utils/useName"
import {usePath} from "utils/usePath"
import {ColorChooser} from "./ColorChooser"
import {IconChooser} from "./IconChooser"

export const Inputs: FC = () => {
  const [homedir] = useQuery(getHomedir, {})

  const {data: nameData = {name: ""}} = useName()
  const {data: pathData = {path: ""}} = usePath()

  return (
    <>
      <div className="px-4 py-5 space-y-6 sm:px-6">
        <div className="grid grid-cols-2 gap-6">
          <IconChooser />
          <ColorChooser />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-5 text-gray-700">
            Name
          </label>
          <div className="mt-1 rounded-md shadow-sm">
            <input
              value={nameData.name}
              onChange={(e) => {
                const name = toKebabCase(e.target.value)

                localStorage.setItem("name", JSON.stringify({name}))
                mutate("name", {name})
              }}
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
          <div className="flex w-full mt-1 rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 text-gray-500 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 sm:text-sm">
              {homedir}/
            </span>
            <input
              value={pathData.path}
              onChange={(e) => {
                const path = toKebabCase(e.target.value)

                localStorage.setItem("path", JSON.stringify({path}))
                mutate("path", {path})
              }}
              id="path"
              className="flex-1 block w-full rounded-none form-input sm:text-sm sm:leading-5 rounded-r-md"
              placeholder="projects/my-awesome-project"
            />
          </div>
        </div>
      </div>
    </>
  )
}
