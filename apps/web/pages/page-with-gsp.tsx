import {GetStaticProps} from "next"
import {gSP} from "../src/server-setup"

export const getStaticProps: GetStaticProps = gSP(async (req, res, ctx) => {
  // const session = await getSession(req, res)
  return {
    props: {
      data: {
        userId: ctx?.session.userId,
        // session: {
        //   id: session.userId,
        //   publicData: session.$publicData,
        // },
      },
    },
  }
})

function Page({data}) {
  return <div>{JSON.stringify(data, null, 2)}</div>
}

export default Page
