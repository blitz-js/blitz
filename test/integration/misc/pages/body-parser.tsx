import getError from "app/queries/getError"
import {useQuery} from "blitz"
import {Suspense} from "react"
import {ErrorBoundary} from "react-error-boundary"

function Content() {
  const [result] = useQuery(getError, undefined)

  return <div id="content">{result}</div>
}

function Page() {
  return (
    <div id="page">
      <ErrorBoundary FallbackComponent={() => <div id="error">query failed</div>}>
        <Suspense fallback="Loading...">
          <Content />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default Page
