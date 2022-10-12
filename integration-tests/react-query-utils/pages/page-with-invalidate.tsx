import React, {Suspense} from "react"
import {BlitzPage} from "@blitzjs/next"
import {invalidateQuery, useQuery} from "@blitzjs/rpc"
import getSequence from "../app/queries/getSequence"

const useQueryOptions = {
  refetchInterval: 0,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
}

const PageWithInvalidateQuery: React.FC = () => {
  const [query1, {isFetching: isQ1Fetching}] = useQuery(getSequence, "query1", useQueryOptions)
  const [query2, {isFetching: isQ2Fetching}] = useQuery(getSequence, "query2", useQueryOptions)

  const isFetching = isQ1Fetching || isQ2Fetching

  const onRevalidateBoth = async () => {
    await invalidateQuery(getSequence)
  }
  const onRevalidateFirst = async () => {
    await invalidateQuery(getSequence, "query1")
  }

  return (
    <div>
      <h1>Hello from PageWithInvalidateQuery</h1>
      <button id="invalidate-both" onClick={onRevalidateBoth}>
        Both
      </button>
      <button id="invalidate-first" onClick={onRevalidateFirst}>
        First
      </button>

      {isFetching && <h3>Loading...</h3>}
      {!isFetching && (
        <div id="data">
          <h2 id="data-first">{query1}</h2>
          <h2 id="data-second">{query2}</h2>
        </div>
      )}
    </div>
  )
}

const PageWithInvalidateQueryPage: BlitzPage = () => {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <PageWithInvalidateQuery />
    </Suspense>
  )
}

export default PageWithInvalidateQueryPage
