import {useRouter as useRouterByNext} from 'next/router'
import {useParams} from './use-params'
import {useRouterQuery} from './use-router-query'

export function useRouter() {
  const router = useRouterByNext()
  const query = useRouterQuery()
  const params = useParams()

  return {...router, query, params}
}
