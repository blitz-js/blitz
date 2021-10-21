import getError from "app/queries/getError"
import {ErrorBoundary, useQuery} from "blitz"
import {Suspense} from "react"

function Content() {
  const [result] = useQuery(getError, undefined)

  return <div id="content">{result}</div>
}

function BodyParser() {
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

export default BodyParser
