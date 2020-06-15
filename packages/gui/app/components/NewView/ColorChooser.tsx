import {FC, useState} from 'react'
import {mutate} from 'swr'

import {useToggle} from 'utils/hooks/state/useToggle'
import {useColor} from 'utils/useColor'

const colors = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink']

type ColorProps = {
  color: string
}

const Color: FC<ColorProps> = ({color}) => {
  return <div className={`w-6 h-6 rounded-md bg-${color}-500`} />
}

export const ColorChooser: FC = () => {
  const {data: colorData = {color: ''}} = useColor()

  const [isOpen, setOpen, toggleOpen] = useToggle(useState<boolean>(false))

  const handleClick = (color: string) => {
    if (color !== colorData.color) {
      localStorage.setItem('color', JSON.stringify({color}))
      mutate('color', {color})
      toggleOpen()
    } else if (color === colorData.color) {
      localStorage.setItem('color', JSON.stringify({color: ''}))
      mutate('color', {color: ''})
      toggleOpen()
    }
  }

  return (
    <div>
      <label htmlFor="color-menu" className="block text-sm font-medium leading-5 text-gray-700">
        Color
      </label>
      <div className="relative inline-block w-full mt-1 text-left">
        <div>
          <span className="rounded-md shadow-sm">
            <button
              onClick={toggleOpen}
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800"
              id="color-menu"
              aria-haspopup="true"
              aria-expanded="true">
              <svg className="w-5 h-5 my-auto mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {colorData.color.length > 0 ? <Color color={colorData.color} /> : 'Choose a color'}
            </button>
          </span>
        </div>
        {isOpen && (
          <div className="absolute left-0 w-full mt-2 rounded-md shadow-lg">
            <div className="bg-white rounded-md shadow-xs">
              <div
                className="grid grid-cols-6 gap-1 p-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="color-menu">
                {colors.map((color) => (
                  <button
                    onClick={() => handleClick(color)}
                    type="button"
                    className={`flex items-center justify-center w-full px-4 py-2 text-sm leading-5 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                      color === colorData.color && 'bg-indigo-100 focus:bg-indigo-100'
                    }`}
                    role="menuitem">
                    <Color color={color} />
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
