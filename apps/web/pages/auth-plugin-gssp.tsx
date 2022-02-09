import {GetServerSideProps} from "next"
// import {gSSP} from "../src/server-setup"

// export const getServerSideProps: GetServerSideProps = gSSP(async (req, res, ctx) => {
//   console.log({ctx})
//   return {
//     props: {data: ctx?.userId ?? null},
//   }
// })

function Page({data}) {
  return <div>{JSON.stringify(data)}</div>
}

export default Page
