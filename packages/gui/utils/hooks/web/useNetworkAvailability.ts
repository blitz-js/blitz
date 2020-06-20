import {useEffect, useState} from "react"

import {canUseDOM} from "utils/canUseDom"
import {managedEventListener} from "utils/managedEventListener"

export const useNetworkAvailability = (): boolean => {
  const [online, setOnline] = useState(canUseDOM ? navigator.onLine : true)

  useEffect(() => {
    const cleanup1 = managedEventListener(window, "offline", () => {
      setOnline(false)
    })

    const cleanup2 = managedEventListener(window, "online", () => {
      setOnline(true)
    })

    return (): void => {
      cleanup1()
      cleanup2()
    }
  }, [])

  return online
}
