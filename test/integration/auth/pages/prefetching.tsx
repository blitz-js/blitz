import getAuthenticatedBasic from "app/queries/getAuthenticatedBasic"
import {
  dehydrate,
  getQueryKey,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  QueryClient,
  useQuery,
} from "blitz"
import {Suspense, useEffect} from "react"

function Content() {
  const [result] = useQuery(getAuthenticatedBasic, null, {
    staleTime: 60 * 1000,
  })

  return <div id="content">{result}</div>
}

function Bomb() {
  useEffect(() => {
    throw new Error("💣")
  })

  return <>somebody set up us the bomb</>
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

Page.authenticate = true

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(getQueryKey(getAuthenticatedBasic, null), () =>
    invokeWithMiddleware(getAuthenticatedBasic, null, ctx),
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}
