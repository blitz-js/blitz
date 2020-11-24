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

// ------------------------------------------------------------------------
// FOR INTERNAL USE ONLY
// from: https://github.com/vercel/next.js/issues/8259#issuecomment-650225962
// TODO: switch to next.js router.isReady once this issue is fixed there
// ------------------------------------------------------------------------
export function useRouterIsReady() {
  const router = useNextRouter()

  const hasParams = /\[.+\]/.test(router.route) || /\?./.test(router.asPath)
  const queryKeys = Object.keys(router.query)
  const queryIsEmpty = queryKeys.length === 0 || (queryKeys.length === 1 && queryKeys[0] === "amp")
  const ready = !hasParams || !queryIsEmpty

  return ready
}
