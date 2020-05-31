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

const getStatusMeta = (status: string) => {
  switch (status) {
    case CREATING_FILES:
      return {
        svg: <DocumentDuplicateOutline className="w-6 h-6 text-indigo-600" />,
        name: 'Creating files',
        description: 'Description of this step.',
      }
    case DONE:
      return {
        svg: <CheckCircleOutline className="w-6 h-6 text-indigo-600" />,
        name: 'Finishing',
        description: 'Description of this step.',
      }
    case INSTALLING_DEPS:
      return {
        svg: <ArrowCircleDownOutline className="w-6 h-6 text-indigo-600" />,
        name: 'Installing dependencies',
        description: 'Description of this step.',
      }
    case RETRIEVING_DEPS:
      return {
        svg: <CloudDownloadOutline className="w-6 h-6 text-indigo-600" />,
        name: 'Retrieving dependencies',
        description: 'Description of this step.',
      }
    case UNKNOWN:
      return {
        svg: <ClockOutline className="w-6 h-6 text-indigo-600" />,
        name: 'Working',
        description: 'Description of this step.',
      }
    default:
      return {
        svg: <ClockOutline className="w-6 h-6 text-indigo-600" />,
        name: 'Working',
        description: 'Description of this step.',
      }
  }
}

type CreateProjectStatusProps = {
  path: string
}

export const CreateProjectStatus: FC<CreateProjectStatusProps> = ({path}) => {
  const [status] = useQuery(getCreateProjectStatus, path, {
    refetchInterval: 100,
  })

  const [dots, setDots] = useState(0)

  useInterval(() => {
    setDots(dots < 3 ? dots + 1 : 0)
  }, 500)

  return (
    <div className="sm:flex sm:items-start">
      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-indigo-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
        {getStatusMeta(status).svg}
      </div>
      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
        <h3 className="text-lg font-medium leading-6" id="modal-headline">
          {getStatusMeta(status).name}
          {Array(dots).fill('.')}
        </h3>
        <div className="mt-2">
          <p className="text-sm leading-5 text-gray-500">{getStatusMeta(status).description}</p>
        </div>
      </div>
    </div>
  )
}
