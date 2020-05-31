import {useEffect, useState} from 'react'

export const useDelayUnmount = (isMounted: boolean, delayMs: number) => {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    let timeoutId: number
    if (isMounted && !shouldRender) {
      setShouldRender(true)
    } else if (!isMounted && shouldRender) {
      // @ts-ignore
      timeoutId = setTimeout(() => setShouldRender(false), delayMs)
    }
    return () => clearTimeout(timeoutId)
  }, [isMounted, delayMs, shouldRender])
  return shouldRender
}
