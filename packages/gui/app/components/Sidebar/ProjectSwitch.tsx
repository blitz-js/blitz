import Tippy from '@tippyjs/react'
import {Link, useParam} from 'blitz'
import * as Icons from 'heroicons-react'
import {FC} from 'react'

import {ProjectSwitchProps} from './types'

export const ProjectSwitch: FC<ProjectSwitchProps> = ({project}) => {
  const id = useParam('id', 'string')
  const isActive = id === project.id
  const isRunning = true

  // @ts-ignore
  const Icon = Icons[`${project.icon}Outline`]

  return (
    <>
      <Tippy content={project.name} placement="right" trigger="mouseenter focusin">
        <div>
          <Link href="/p/[id]" as={`/p/${project.id}`}>
            <a
              className={`flex justify-center py-2 transition duration-150 ease-in-out border-l-3 border-r-3 border-transparent opacity-50 inactive hover:bg-gray-50 hover:border-gray-200 hover:opacity-100 focus:outline-none ${
                isActive &&
                'border-gray-900 bg-gray-50 opacity-100 active hover:bg-indigo-50 hover:border-indigo-600'
              }`}
              style={{borderRightColor: 'transparent'}}>
              <div
                className={`flex relative items-center justify-center w-12 h-12 text-${project.color}-600 bg-${project.color}-100 rounded-full`}>
                <Icon className="w-6 h-6" />
                {isRunning && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-pink-600 border-2 border-white rounded-full" />
                )}
              </div>
            </a>
          </Link>
        </div>
      </Tippy>
      <style jsx>{`
        a.inactive {
          filter: grayscale(80%);
        }

        a.inactive:hover {
          filter: grayscale(0);
        }

        a.active {
          filter: grayscale(0);
        }
      `}</style>
    </>
  )
}
