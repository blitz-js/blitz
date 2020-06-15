import {Link, useRouter} from 'blitz'
import {FC} from 'react'

import {useColor} from 'utils/useColor'
import {useIcon} from 'utils/useIcon'
import {useName} from 'utils/useName'
import {usePath} from 'utils/usePath'
import {FooterProps} from './types'

export const Footer: FC<FooterProps> = ({isSubmitting}) => {
  const router = useRouter()

  const {data: nameData = {name: ''}} = useName()
  const {data: pathData = {path: ''}} = usePath()
  const {data: iconData = {icon: ''}} = useIcon()
  const {data: colorData = {color: ''}} = useColor()

  return (
    <div className="px-4 py-3 border-t border-gray-200 sm:px-6 sm:flex sm:flex-row-reverse">
      <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
        <button
          disabled={
            isSubmitting ||
            nameData.name.length === 0 ||
            pathData.path.length === 0 ||
            iconData.icon.length === 0 ||
            colorData.color.length === 0
          }
          type="submit"
          className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo sm:text-sm sm:leading-5 disabled:opacity-50">
          {router.pathname === '/new' ? 'Create' : 'Import'} project
        </button>
      </span>
      <span className="flex w-full mt-3 rounded-md shadow-sm sm:mt-0 sm:w-auto">
        <Link href="/">
          <a className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue sm:text-sm sm:leading-5">
            Cancel
          </a>
        </Link>
      </span>
    </div>
  )
}
