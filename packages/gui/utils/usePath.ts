import useSWR from "swr"

import {storage} from "./storage"

export const usePath = () => {
  const swr = useSWR<{path: string}>("path", storage)

  return swr
}
