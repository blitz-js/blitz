import {useRouter} from "next/router"
import {parse} from "url"

export function useRouterQuery() {
  const router = useRouter()
  const {query} = parse(router.asPath, true)
  return query
}
