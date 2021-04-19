import getBasic from "app/queries/getBasic"
import {useQuery} from "blitz"

function Content() {
  const [result, {isLoading}] = useQuery(getBasic, undefined)
  if (isLoading) {
    return <>Loading...</>
  } else {
    return <div id="content">{result}</div>
  }
}

function Page() {
  return (
    <div id="page">
      <Content />
    </div>
  )
}

export default Page
