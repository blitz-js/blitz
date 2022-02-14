import {GetServerSideProps} from "next"
import {gSSP} from "../src/server-setup"

export const getServerSideProps: GetServerSideProps = gSSP(async (req, res, ctx) => {
  const session = ctx.session
  return {
    props: {
      data: {
        userId: session.userId,
        publicData: session.$publicData,
      },
    },
  }
})

function Page({data}) {
  return <div>{JSON.stringify(data, null, 2)}</div>
}

export default Page
