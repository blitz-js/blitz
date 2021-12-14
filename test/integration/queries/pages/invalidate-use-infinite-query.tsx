import getIncremented from "app/queries/getIncrementedWithPagination"
import {invalidateQuery, useInfiniteQuery} from "blitz"
import {Suspense} from "react"

function Content() {
  const [groups] = useInfiniteQuery(
    getIncremented,
    (page = {take: 5, skip: 0}) => ({
      where: {value: {gte: 10}},
      ...page,
    }),
    {
      getNextPageParam: (lastGroup) => lastGroup.nextPage,
    },
  )
  return (
    <>
      <button onClick={() => invalidateQuery(getIncremented)}>click me</button>
      <div id="content">{JSON.stringify(groups)}</div>
    </>
  )
}

function InvalidateInfiniteQuery() {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

export default InvalidateInfiniteQuery
