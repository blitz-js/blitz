import useSWR from 'swr'

import {storage} from './storage'

export const useIcon = () => {
  const swr = useSWR<{icon: string}>('icon', storage)

  return swr
}
