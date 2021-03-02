import {WithRouterProps as WithNextRouterProps} from "next/dist/client/with-router"
import {
  default as NextRouter,
  NextRouter as NextRouterType,
  useRouter as useNextRouter,
  withRouter as withNextRouter,
} from "next/router"
import React from "react"
import {extractRouterParams, useParams} from "./use-params"

export const Router = NextRouter
export {createRouter, makePublicRouterInstance} from "next/router"
export {RouterContext} from "next/dist/next-server/lib/router-context"

export {useParam, useParams} from "./use-params"

export interface BlitzRouter extends NextRouterType {
  params: ReturnType<typeof extractRouterParams>
  query: ReturnType<typeof useRouterQuery>
}

export interface WithRouterProps {
  router: BlitzRouter
}

export function withRouter(WrappedComponent: React.ComponentType<WithRouterProps>) {
  const Wrapper: React.FC<WithNextRouterProps> = ({router}) => {
    const query = useRouterQuery()
    const params = useParams()
    return <WrappedComponent router={{...router, query, params}} />
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

export function useRouterQuery() {
  const router = useNextRouter()

  const query = React.useMemo(() => {
    const query = decode(router.asPath.split("?")[1])
    return query
  }, [router.asPath])

  return query
}

/*
 * Copied from https://github.com/lukeed/qss
 */
function toValue(mix: any) {
  if (!mix) return ""
  var str = decodeURIComponent(mix)
  if (str === "false") return false
  if (str === "true") return true
  return +str * 0 === 0 ? +str : str
}
function decode(str: string) {
  if (!str) return {}
  let tmp: any
  let k
  const out: Record<string, any> = {}
  const arr = str.split("&")

  // eslint-disable-next-line no-cond-assign
  while ((tmp = arr.shift())) {
    tmp = tmp.split("=")
    k = tmp.shift()
    if (out[k] !== void 0) {
      out[k] = [].concat(out[k], toValue(tmp.shift()) as any)
    } else {
      out[k] = toValue(tmp.shift())
    }
  }

  return out
}
