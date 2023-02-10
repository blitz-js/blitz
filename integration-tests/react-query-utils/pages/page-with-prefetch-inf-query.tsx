import {useInfiniteQuery} from "@blitzjs/rpc"
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
  const [data] = useInfiniteQuery(
    testQuery,
    (pageParams) => ({...pageParams, name: "hello world"}),
    {
      suspense: false,
      getNextPageParam: (lastPage) => lastPage,
    },
  )
  return <div id="data">{data ? data : "no-data"}</div>
}

export default PageWithPrefetchInfQuery
