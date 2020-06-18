import useSWR from 'swr'

import {storage} from './storage'

export const useColor = () => {
  const swr = useSWR<{color: string}>('color', storage)

  return swr
}
