import {SessionContext} from "@blitzjs/auth"
import {gSSP} from "src/blitz-server"

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
      publishedAt: new Date(0),
    },
  }
})

function PageWithGssp(props: Props) {
  return <div>{JSON.stringify(props, null, 2)}</div>
}

export default PageWithGssp
