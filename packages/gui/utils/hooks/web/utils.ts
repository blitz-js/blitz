import {useCallback, useEffect, useRef} from 'react'

import {EventMap} from './types'

export const canUseDOM = typeof window !== 'undefined'

export const dethunkify = <T>(value: T | (() => T)): T =>
  typeof value === 'function' ? (value as () => T)() : value

export const managedEventListener = <T extends EventTarget, K extends keyof EventMap<T> & string>(
  target: T,
  type: K,
  callback: (event: EventMap<T>[K]) => void,
  options?: AddEventListenerOptions,
): (() => void) => {
  target.addEventListener(type, callback as EventListener, options)

  return (): void => {
    target.removeEventListener(type, callback as EventListener, options)
  }
}

export const managedInterval = (callback: () => void, delayMs: number): (() => void) => {
  const id = setInterval(callback, delayMs)

  return (): void => {
    clearInterval(id)
  }
}

export const useEventCallback = <T extends Function>(callback: T): ((...args: unknown[]) => T) => {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = callback
  }, [callback])

  return useCallback((...args): T => ref.current!(...args), [ref])
}
