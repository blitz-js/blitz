import getDate from "app/queries/getDate"
import {
  dehydrate,
  getQueryKey,
  GetServerSideProps,
  invokeWithMiddleware,
  QueryClient,
  useQuery,
} from "blitz"
import {Suspense} from "react"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  const queryKey = getQueryKey(getDate, undefined)
  await queryClient.prefetchQuery(queryKey, () => invokeWithMiddleware(getDate, undefined, ctx))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Content() {
  const [date] = useQuery(getDate, undefined)
  return <p id="content">date is Date: {"" + (date instanceof Date)}</p>
}

function Page() {
  return (
    <Suspense fallback="Loading ...">
      <Content />
    </Suspense>
  )
}

export default Page
