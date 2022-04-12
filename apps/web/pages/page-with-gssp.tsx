import {SessionContext} from "@blitzjs/auth"
import {gSSP} from "app/blitz-server"

type Props = {
  userId: unknown
  publicData: SessionContext["$publicData"]
}

export const getServerSideProps = gSSP<Props>(async ({ctx}) => {
  const {session} = ctx
  return {
    props: {
      userId: session.userId,
      publicData: session.$publicData,
    },
  }
})

function Page(props: Props) {
  return <div>{JSON.stringify(props, null, 2)}</div>
}

export default Page
