import * as Icons from 'heroicons-react'
import {FC, useState} from 'react'
import {mutate} from 'swr'

import {useToggle} from 'utils/hooks/state/useToggle'
import {useIcon} from 'utils/useIcon'

type IconProps = {
  icon: string
}

const Icon: FC<IconProps> = ({icon}) => {
  // @ts-ignore
  const Icon = Object.assign({}, Icons)[icon]

  return <Icon className="w-6 h-6" />
}

export const IconChooser: FC = () => {
  const {data: iconData = {icon: ''}} = useIcon()

  const [isOpen, setOpen, toggleOpen] = useToggle(useState<boolean>(false))

  const handleClick = (icon: string) => {
    if (icon !== iconData.icon) {
      localStorage.setItem('icon', JSON.stringify({icon}))
      mutate('icon', {icon})
      toggleOpen()
    } else if (icon === iconData.icon) {
      localStorage.setItem('icon', JSON.stringify({icon: ''}))
      mutate('icon', {icon: ''})
      toggleOpen()
    }
  }

  return (
    <div>
      <label htmlFor="color-menu" className="block text-sm font-medium leading-5 text-gray-700">
        Icon
      </label>
      <div className="relative inline-block w-full mt-1 text-left">
        <div>
          <span className="rounded-md shadow-sm">
            <button
              onClick={toggleOpen}
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800"
              id="icon-menu"
              aria-haspopup="true"
              aria-expanded="true">
              <svg className="w-5 h-5 my-auto mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {iconData.icon.length > 0 ? <Icon icon={iconData.icon} /> : 'Choose an icon'}
            </button>
          </span>
        </div>
        {isOpen && (
          <div className="absolute left-0 w-full h-64 mt-2 overflow-auto rounded-md shadow-lg">
            <div className="bg-white rounded-md shadow-xs">
              <div
                className="grid grid-cols-6 gap-1 p-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="icon-menu">
                {Object.keys(Icons)
                  .filter((icon) => icon.toLowerCase().indexOf('outline') > -1)
                  .filter((icon) => icon.toLowerCase().indexOf('arrow') === -1)
                  .filter((icon) => icon.toLowerCase().indexOf('caret') === -1)
                  .filter((icon) => icon.toLowerCase().indexOf('menu') === -1)
                  .map((icon) => (
                    <button
                      onClick={() => handleClick(icon)}
                      type="button"
                      className={`flex items-center justify-center w-full px-4 py-2 text-sm leading-5 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 ${
                        icon === iconData.icon &&
                        'bg-indigo-100 text-indigo-600 focus:bg-indigo-100 focus:text-indigo-600'
                      }`}
                      role="menuitem">
                      <Icon icon={icon} />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
