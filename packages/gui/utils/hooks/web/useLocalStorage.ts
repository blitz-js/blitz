// based on https://github.com/kripod/react-hooks/blob/master/packages/web-api-hooks/src/useLocalStorage.ts

import {JSONValue} from 'utils/types/JSONValue'
import {useStorage} from 'utils/hooks/web/useStorage'

const getLocalStorage = (): Storage => localStorage

export const useLocalStorage = <T extends JSONValue>(
  key: string,
  initialValue: T | (() => T) | null = null,
  errorCallback?: (error: DOMException | TypeError) => void,
): [T, React.Dispatch<React.SetStateAction<T>>] =>
  useStorage(getLocalStorage, key, initialValue, errorCallback)
