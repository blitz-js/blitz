import {queryCache} from "react-query"

type MutateOptions = {
  refetch?: boolean
}

export interface QueryCacheFunctions<T> {
  mutate: (newData: T | ((oldData: T | undefined) => T), opts?: MutateOptions) => void
}

export const getQueryCacheFunctions = <T>(queryKey: string): QueryCacheFunctions<T> => ({
  mutate: (newData, opts = {refetch: true}) => {
    queryCache.setQueryData(queryKey, newData)
    if (opts.refetch) {
      return queryCache.invalidateQueries(queryKey, {refetchActive: true})
    }
    return null
  },
})
