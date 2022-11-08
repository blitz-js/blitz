import {SessionContext} from "@blitzjs/auth"
import {invokeWithCtx} from "@blitzjs/rpc"
import {gSSP} from "src/blitz-server"
import getUsersAuth from "src/queries/getUsersAuth"

type Props = {
  userId: unknown
  publicData: SessionContext["$publicData"]
}

export const getServerSideProps = gSSP<Props>(async ({ctx}) => {
  const {session} = ctx

  const users = await invokeWithCtx(getUsersAuth, {}, ctx)

  console.log({users})

  return {
    props: {
      userId: session.userId,
      publicData: session.$publicData,
      publishedAt: new Date(0),
    },
  }
})

function PageWithInvokeCtx(props: Props) {
  return <div>{JSON.stringify(props, null, 2)}</div>
}

export default PageWithInvokeCtx
