import {gSP} from "../src/server-setup"

export const getStaticProps = gSP(async ({ctx}) => {
  return {
    props: {
      data: {
        // userId: ctx?.session.userId,
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
