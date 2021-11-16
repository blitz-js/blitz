import getNoauthBasic from "app/queries/getNoauthBasic"
import {
  dehydrate,
  getQueryKey,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  QueryClient,
  useQuery,
} from "blitz"
import {Suspense} from "react"

function Content() {
  const [result] = useQuery(getNoauthBasic, null, {
    staleTime: 60 * 1000,
  })

  return <div id="content">{result}</div>
}

function Bomb() {
  return <div id="content">somebody set up us the bomb</div>
}

export default function Page() {
  return (
    <div id="page">
      <Suspense fallback={<Bomb />}>
        <Content />
      </Suspense>
    </div>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(getQueryKey(getNoauthBasic, null), () =>
    invokeWithMiddleware(getNoauthBasic, null, ctx),
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}
