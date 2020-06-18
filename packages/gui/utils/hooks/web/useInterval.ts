import {useEffect} from 'react'

import {managedInterval, useEventCallback} from './utils'

export const useInterval = (callback: () => void, delayMs: number | null): void => {
  const savedCallback = useEventCallback(callback)

  useEffect(() => (delayMs != null ? managedInterval(savedCallback, delayMs) : undefined), [
    delayMs,
    savedCallback,
  ])
}
