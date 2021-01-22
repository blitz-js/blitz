import {useRouter} from "next/router"
import {useMemo} from "react"
import {parse} from "url"

export function useRouterQuery() {
  const router = useRouter()

  const query = useMemo(() => {
    const {query} = parse(router.asPath, true)

    return query
  }, [router.asPath])

  return query
}
