import React from 'react'
import {withRouter as withRouterNext, NextRouter as NextRouterNext} from 'next/router'
import {WithRouterProps as WithRouterPropsNext} from 'next/dist/client/with-router'
import {useParams, extractRouterParams} from './use-params'
import {useRouterQuery} from './use-router-query'

export interface Router extends NextRouterNext {
  params: ReturnType<typeof extractRouterParams>
}

interface WithRouterProps {
  router: Router
}

export function withRouter(WrappedComponent: React.ComponentType<WithRouterProps>) {
  const Wrapper: React.FC<WithRouterPropsNext> = ({router}) => {
    const query = useRouterQuery()
    const params = useParams()
    return <WrappedComponent router={{...router, query, params}} />
  }
  return withRouterNext(Wrapper)
}
