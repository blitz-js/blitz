import {GetServerSideProps, getSession} from "blitz"
import {Suspense} from "react"

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  const session = await getSession(req, res)
  await session.$setPublicData({role: "user"})

  return {
    props: {},
  }
}

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
