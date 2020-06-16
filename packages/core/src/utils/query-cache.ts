import {queryCache} from 'react-query'

export interface QueryCacheFunctions<T> {
  mutate: (newData: T | ((oldData: T | undefined) => T | undefined)) => void
}

export const getQueryCacheFunctions = <T>(queryKey: string): QueryCacheFunctions<T> => ({
  mutate: (newData) => {
    queryCache.setQueryData(queryKey, newData)
    return queryCache.refetchQueries(queryKey, {force: true})
  },
})
