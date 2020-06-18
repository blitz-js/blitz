import {useQuery} from 'blitz'
import {
  ArrowCircleDownOutline,
  CheckCircleOutline,
  ClockOutline,
  CloudDownloadOutline,
  DocumentDuplicateOutline,
} from 'heroicons-react'
import {FC, useState} from 'react'

import getCreateProjectStatus from 'app/queries/getCreateProjectStatus'
import {CREATING_FILES, DONE, INSTALLING_DEPS, RETRIEVING_DEPS, UNKNOWN} from 'utils/status'
import {useInterval} from 'utils/hooks/web/useInterval'
import {StatusProps} from './types'

const getStatusMeta = (status: string) => {
  switch (status) {
    case CREATING_FILES:
      return {
        svg: <DocumentDuplicateOutline className="w-6 h-6 text-indigo-600 sm:w-8 sm:h-8" />,
        name: 'Creating files',
        description: 'Hang tight while we set up your new Blitz app!',
      }
    case DONE:
      return {
        svg: <CheckCircleOutline className="w-6 h-6 text-indigo-600 sm:w-8 sm:h-8" />,
        name: 'Finishing',
        description: 'Your new Blitz app is ready!',
      }
    case INSTALLING_DEPS:
      return {
        svg: <ArrowCircleDownOutline className="w-6 h-6 text-indigo-600 sm:w-8 sm:h-8" />,
        name: 'Installing dependencies',
        description: 'We’re installing your project’s dependencies. This might take a while!',
      }
    case RETRIEVING_DEPS:
      return {
        svg: <CloudDownloadOutline className="w-6 h-6 text-indigo-600 sm:w-8 sm:h-8" />,
        name: 'Retrieving dependencies',
        description: 'Retrieving the freshest of dependencies.',
      }
    case UNKNOWN:
      return {
        svg: <ClockOutline className="w-6 h-6 text-indigo-600 sm:w-8 sm:h-8" />,
        name: 'Working',
        description: 'Hang on tight! Magic’s happening.',
      }
    default:
      return {
        svg: <ClockOutline className="w-6 h-6 text-indigo-600 sm:w-8 sm:h-8" />,
        name: 'Working',
        description: 'Hang on tight! Magic’s happening.',
      }
  }
}

export const Status: FC<StatusProps> = ({path}) => {
  const [status] = useQuery(
    getCreateProjectStatus,
    {path},
    {
      refetchInterval: 150,
    },
  )

  const [dots, setDots] = useState(0)

  useInterval(() => {
    setDots(dots < 3 ? dots + 1 : 0)
  }, 500)

  return (
    <div className="flex flex-col justify-center h-full px-4 py-5 sm:px-6">
      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-indigo-100 rounded-full sm:w-16 sm:h-16">
        {getStatusMeta(status).svg}
      </div>
      <div className="mt-3 text-center sm:mt-4">
        <h3 className="relative text-lg font-medium leading-6 sm:text-xl">
          {getStatusMeta(status).name}
          <span className="absolute">{Array(dots).fill('.')}</span>
        </h3>
        <div className="mt-2 sm:mt-3">
          <p className="leading-5 text-gray-500 ">{getStatusMeta(status).description}</p>
        </div>
      </div>
    </div>
  )
}
