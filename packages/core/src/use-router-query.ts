import {useState} from "react"
import {isEqual} from "lodash"
import {useRouter} from "next/router"
import {parse} from "url"

export function useRouterQuery() {
  const router = useRouter()

  const {query} = parse(router.asPath, true)

  const [lastQuery, setLastQuery] = useState(query)

  if (!isEqual(query, lastQuery)) {
    setLastQuery(query)
  }

  return lastQuery
}
