import getMap from "app/queries/getMap"
import {
  dehydrate,
  getQueryKey,
  GetServerSideProps,
  invokeWithMiddleware,
  QueryClient,
  usePaginatedQuery,
} from "blitz"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  const queryKey = getQueryKey(getMap, undefined)
  await queryClient.prefetchQuery(queryKey, () => invokeWithMiddleware(getMap, undefined, ctx))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Content() {
  const [map] = usePaginatedQuery(getMap, undefined)
  return <p id="content">map is Map: {"" + (map instanceof Map)}</p>
}

function DehydratedStateWithPagination() {
  return <Content />
}

export default DehydratedStateWithPagination
