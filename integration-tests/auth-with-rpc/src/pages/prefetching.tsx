import {gSSP} from "../blitz-server"
import {GetServerSidePropsContext} from "next"
import {dehydrate, getQueryClient, getQueryKey, QueryClient, useQuery} from "@blitzjs/rpc"
import getNoauthBasic from "../queries/getNoauthBasic"
import {Suspense} from "react"
import {SessionContext} from "@blitzjs/auth"

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

type Props = {
  dehydratedState: any
}

export const getServerSideProps = gSSP<Props>(async ({ctx}) => {
  await getQueryClient().prefetchQuery(getQueryKey(getNoauthBasic, null), () =>
    getNoauthBasic(null, ctx),
  )
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
})
