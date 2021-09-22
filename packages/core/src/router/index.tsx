import {
  default as NextRouter,
  NextRouter as NextRouterType,
  useRouter as useNextRouter,
  withRouter as withNextRouter,
} from "next/router"
import React from "react"
import {extractRouterParams, useParams, useRouterQuery} from "./router-hooks"

export const Router = NextRouter
export {createRouter, makePublicRouterInstance} from "next/router"
export {RouterContext} from "next/dist/shared/lib/router-context"

export {useParam, useParams, useRouterQuery} from "./router-hooks"

export interface BlitzRouter extends NextRouterType {
  params: ReturnType<typeof extractRouterParams>
  query: ReturnType<typeof useRouterQuery>
}

export interface WithRouterProps {
  router: BlitzRouter
}

export const withRouter: typeof withNextRouter = (WrappedComponent) => {
  function Wrapper({router, ...props}: any) {
    const query = useRouterQuery()
    const params = useParams()
    return <WrappedComponent router={{...router, query, params}} {...props} />
  }
  return withNextRouter(Wrapper)
}

export function useRouter() {
  const router = useNextRouter()
  const query = useRouterQuery()
  const params = useParams()

  // TODO - we have to explicitly define the return type otherwise TS complains about
  // NextHistoryState and TransitionOptions not being exported from Next.js code
  return React.useMemo(() => {
    return {...router, query, params}
  }, [params, query, router]) as BlitzRouter
}
