import {useRef} from "react"
import {isEqual} from "lodash"
import {useRouter} from "next/router"
import {parse} from "url"

export function useRouterQuery() {
  const router = useRouter()

  const {query} = parse(router.asPath, true)

  const lastQueryRef = useRef(query)

  if (!isEqual(query, lastQueryRef.current)) {
    lastQueryRef.current = query
  }

  return lastQueryRef.current
}
