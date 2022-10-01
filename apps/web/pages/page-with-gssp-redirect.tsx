import {SessionContext} from "@blitzjs/auth"
import {Routes} from "@blitzjs/next"
import {gSSP} from "app/blitz-server"

type Props = {
  userId: unknown
  publicData: SessionContext["$publicData"]
}

export const getServerSideProps = gSSP<Props>(async ({ctx}) => {
  const {session} = ctx

  return {
    redirect: {destination: Routes.Post({postId: "1"})},
    props: {
      userId: session.userId,
      publicData: session.$publicData,
      publishedAt: new Date(0),
    },
  }
})

function PageWithGsspRedirect(props: Props) {
  return <div>{JSON.stringify(props, null, 2)}</div>
}

export default PageWithGsspRedirect
