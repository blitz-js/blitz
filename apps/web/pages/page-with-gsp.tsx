import {gSP} from "app/blitz-server"

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

function PageWithGsp({data}) {
  return <div>{JSON.stringify(data, null, 2)}</div>
}

export default PageWithGsp
