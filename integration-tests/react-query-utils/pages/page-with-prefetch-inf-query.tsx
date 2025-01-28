import {useSuspenseInfiniteQuery} from "@blitzjs/rpc"
import {gSSP} from "../app/blitz-server"
import testQuery from "../app/queries/getInfiniteData"

export const getServerSideProps = gSSP(async ({ctx}) => {
  const {prefetchInfiniteQuery} = ctx
  await prefetchInfiniteQuery(testQuery, {
    name: "hello world",
  })

  return {props: {}}
})

const PageWithPrefetchInfQuery = () => {
  const [data] = useSuspenseInfiniteQuery(
    testQuery,
    (pageParams) => ({...pageParams, name: "hello world"}),
    {
      getNextPageParam: (lastPage) => lastPage,
      initialPageParam: {name: "hello world"},
    },
  )
  return <div id="data">{data ? data : "no-data"}</div>
}

export default PageWithPrefetchInfQuery
