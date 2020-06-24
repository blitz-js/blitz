import {queryCache} from "react-query"

export interface QueryCacheFunctions<T> {
  mutate: (newData: T | ((oldData: T | undefined) => T), refetch?: boolean) => void
}

export const getQueryCacheFunctions = <T>(queryKey: string): QueryCacheFunctions<T> => ({
  mutate: (newData, refetch = true) => {
    queryCache.setQueryData(queryKey, newData)
    if (refetch) {
      return queryCache.refetchQueries(queryKey, {force: true})
    }
    return null
  },
})
