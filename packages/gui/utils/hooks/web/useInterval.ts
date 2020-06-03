// based on https://overreacted.io/making-setinterval-declarative-with-react-hooks/

import {useEffect} from 'react'

import {managedInterval} from 'utils/managedInterval'
import {useEventCallback} from 'utils/useEventCallback'

export const useInterval = (callback: () => void, delayMs: number | null): void => {
  const savedCallback = useEventCallback(callback)

  useEffect(() => (delayMs != null ? managedInterval(savedCallback, delayMs) : undefined), [
    delayMs,
    savedCallback,
  ])
}
