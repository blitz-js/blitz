import {InformationCircleOutline} from 'heroicons-react'

import {useNetworkAvailability} from 'utils/hooks/web/useNetworkAvailability'

export const OfflineAlert = () => {
  const isOnline = useNetworkAvailability()

  return isOnline ? null : (
    <div className="bg-red-50">
      <div className="flex items-start max-w-6xl px-4 py-3 mx-auto lg:justify-center sm:px-6 lg:px-8 lg:py-4">
        <div className="flex-shrink-0">
          <InformationCircleOutline className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1 ml-3">
          <p className="text-sm font-medium leading-6 text-red-700">
            You are not connected to a network! Check your computer’s settings.
          </p>
        </div>
      </div>
    </div>
  )
}
