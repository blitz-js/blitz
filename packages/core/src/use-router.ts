import {useRouter as useNextRouter} from "next/router"
import {useMemo} from "react"
import {BlitzRouter} from "./types"
import {useParams} from "./use-params"
import {useRouterQuery} from "./use-router-query"

// TODO - we have to explicitly define the return type otherwise TS complains about
// NextHistoryState and TransitionOptions not being exported from Next.js code
export function useRouter(): BlitzRouter {
  const router = useNextRouter()
  const query = useRouterQuery()
  const params = useParams()

  return useMemo(() => {
    return {...router, query, params}
  }, [params, query, router]) as BlitzRouter
}
