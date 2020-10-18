import {useMemo} from "react"
import {useRouter as useNextRouter, NextRouter} from "next/router"
import {useParams} from "./use-params"
import {useRouterQuery} from "./use-router-query"

// TODO - we have to explicitly define the return type otherwise TS complains about
// NextHistoryState and TransitionOptions not being exported from Next.js code
export function useRouter(): NextRouter &
  ReturnType<typeof useRouterQuery> &
  ReturnType<typeof useParams> {
  const router: any = useNextRouter()
  const query = useRouterQuery()
  const params = useParams()

  return useMemo(() => {
    return {...router, query, params}
  }, [params, query, router])
}
