import getPaginated from "app/queries/getPaginated"
import {
  dehydrate,
  getInfiniteQueryKey,
  GetServerSideProps,
  invokeWithMiddleware,
  QueryClient,
  useInfiniteQuery,
} from "blitz"
import {useState} from "react"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  const queryKey = getInfiniteQueryKey(getPaginated, {where: {value: {gte: 10}}, take: 5, skip: 0})

  await queryClient.prefetchInfiniteQuery(queryKey, () =>
    invokeWithMiddleware(getPaginated, {where: {value: {gte: 10}}, take: 5, skip: 0}, ctx),
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Content() {
  const [value] = useState(10)

  const [groups] = useInfiniteQuery(
    getPaginated,
    (page = {take: 5, skip: 0}) => ({
      where: {value: {gte: value}},
      ...page,
    }),
    {
      getNextPageParam: (lastGroup) => lastGroup.nextPage,
    },
  )
  return <div id="content">{JSON.stringify(groups)}</div>
}

function InfiniteQueryDehydratedState() {
  return <Content />
}

export default InfiniteQueryDehydratedState
