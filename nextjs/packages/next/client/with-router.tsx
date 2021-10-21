import React from 'react'
import { NextComponentType, NextPageContext } from '../shared/lib/utils'
import { NextRouter, useRouter } from './router'

export type WithRouterProps = {
  router: NextRouter
}

export type ExcludeRouterProps<P> = Pick<
  P,
  Exclude<keyof P, keyof WithRouterProps>
>

/**
 * `withRouter` is a higher-order component that takes a component and returns a new one
 * with an additional `router` prop.
 *
 * @example
 * ```
 * import {withRouter} from "blitz"
 *
 * function Page({router}) {
 *  return <p>{router.pathname}</p>
 * }
 *
 * export default withRouter(Page)
 * ```
 *
 * @param WrappedComponent - a React component that needs `router` object in props
 * @returns A component with a `router` object in props
 * @see Docs {@link https://blitzjs.com/docs/router#router-object | router}
 */
export default function withRouter<
  P extends WithRouterProps,
  C = NextPageContext
>(
  ComposedComponent: NextComponentType<C, any, P>
): React.ComponentType<ExcludeRouterProps<P>> {
  function WithRouterWrapper(props: any): JSX.Element {
    return <ComposedComponent router={useRouter()} {...props} />
  }

  WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps
  // This is needed to allow checking for custom getInitialProps in _app
  ;(WithRouterWrapper as any).origGetInitialProps = (ComposedComponent as any).origGetInitialProps
  if (process.env.NODE_ENV !== 'production') {
    const name =
      ComposedComponent.displayName || ComposedComponent.name || 'Unknown'
    WithRouterWrapper.displayName = `withRouter(${name})`
  }

  return WithRouterWrapper
}
