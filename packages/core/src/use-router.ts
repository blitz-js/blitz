import {useRouter as useRouterNext} from 'next/router'
import {useParams} from './use-params'
import {useRouterQuery} from './use-router-query'

export function useRouter() {
  const router = useRouterNext()
  const query = useRouterQuery()
  const params = useParams()

  return {...router, query, params}
}
