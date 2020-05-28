import {useRouter} from 'next/router'
import {parse} from 'url'
import {getRouteRegex, getRouteMatcher} from 'next/dist/next-server/lib/router/utils'

export function useRouterParams() {
  const router = useRouter()
  const {pathname} = parse(router.asPath)
  const params = getRouteMatcher(getRouteRegex(router.route))(pathname)
  if (params) {
    return params
  }

  return {}
}
