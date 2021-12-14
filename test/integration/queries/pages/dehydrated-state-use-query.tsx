import getMap from "app/queries/getMap"
import {
  dehydrate,
  getQueryKey,
  GetServerSideProps,
  invokeWithMiddleware,
  QueryClient,
  useQuery,
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
  const [map] = useQuery(getMap, undefined)
  return <p id="content">map is Map: {"" + (map instanceof Map)}</p>
}

function DehydratedState() {
  return <Content />
}

export default DehydratedState
