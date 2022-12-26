import {gSSP} from "../blitz-server"
import {getSession} from "@blitzjs/auth"
import {GetServerSideProps} from "next"
import {Suspense} from "react"

export const getServerSideProps: GetServerSideProps = gSSP(async ({req, res}) => {
  const session = await getSession(req, res)
  await session.$setPublicData({role: "USER"})

  return {
    props: {},
  }
})

function Content() {
  return (
    <div>
      <div id="content">it works</div>
    </div>
  )
}

function GSSPSetPublicData() {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <Content />
      </Suspense>
    </div>
  )
}

export default GSSPSetPublicData
