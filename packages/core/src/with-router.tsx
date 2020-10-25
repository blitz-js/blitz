import {WithRouterProps as WithNextRouterProps} from "next/dist/client/with-router"
import {NextRouter, withRouter as withNextRouter} from "next/router"
import React from "react"
import {extractRouterParams, useParams} from "./use-params"
import {useRouterQuery} from "./use-router-query"

export {RouterContext} from "next/dist/next-server/lib/router-context"

export interface BlitzRouter extends NextRouter {
  params: ReturnType<typeof extractRouterParams>
}

interface WithRouterProps {
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
