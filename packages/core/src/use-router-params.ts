import {useRouter} from 'next/router'
import {useRouterQuery} from './use-router-query'

export function useRouterParams() {
  const router = useRouter()
  const query = useRouterQuery()

  return Object.fromEntries(
    Object.entries(router.query).filter(
      ([key, value]) => typeof query[key] === 'undefined' || query[key] !== value,
    ),
  )
}
