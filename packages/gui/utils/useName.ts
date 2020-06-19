// kind of a temporary solution because i couldn’t get my localstorage hook
// to sync values properly

// also, consider consolidating all these into a single hook.

import useSWR from "swr"

import {storage} from "./storage"

export const useName = () => {
  const swr = useSWR<{name: string}>("name", storage)

  return swr
}
