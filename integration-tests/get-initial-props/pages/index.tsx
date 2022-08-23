import {NextPage} from "next"
import {Suspense} from "react"

const Page: NextPage = (props) => {
  return (
    <div id="page">
      <Suspense fallback={"Loading..."}>
        <div id="content">{JSON.stringify(props, null, 2)}</div>
      </Suspense>
    </div>
  )
}

Page.getInitialProps = async (context) => {
  return {
    props: {
      anotherTestProp: "index.tsx: testing getInitialProps",
    },
  }
}

export default Page
