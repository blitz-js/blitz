import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react'

import {JSONValue} from './types'
import {dethunkify} from './utils'

export const useStorage = <T extends JSONValue>(
  getStorage: () => Storage | null,
  key: string,
  initialValue: T | (() => T) | null = null,
  errorCallback?: (error: DOMException | TypeError) => void,
): [T, Dispatch<SetStateAction<T>>] => {
  const storage = useMemo(() => {
    try {
      return getStorage()
    } catch {}
    return null
  }, [getStorage])

  const [value, setValue] = useState<T>(() => {
    const serializedValue = storage?.getItem(key)

    if (serializedValue == null) return dethunkify(initialValue)

    try {
      return JSON.parse(serializedValue)
    } catch {
      return serializedValue
    }
  })

  useEffect(() => {
    if (storage) {
      try {
        storage.setItem(key, JSON.stringify(value))
      } catch (error) {
        errorCallback?.(error)
      }
    }
  }, [errorCallback, key, storage, value])

  return [value, setValue]
}
