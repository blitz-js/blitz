import {AppProps, ErrorBoundary, ErrorFallbackProps, useQueryErrorResetBoundary} from "blitz"
import {ReactQueryDevtools} from "react-query/devtools"

if (typeof window !== "undefined") {
  ;(window as any).DEBUG_BLITZ = 1
}

export default function App({Component, pageProps}: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      onReset={useQueryErrorResetBoundary().reset}
    >
      {getLayout(<Component {...pageProps} />)}
      <ReactQueryDevtools />
    </ErrorBoundary>
  )
}

function RootErrorFallback({error}: ErrorFallbackProps) {
  return (
    <div>
      <div id="error">{error.name}</div>
      {error.statusCode} {error.message}
    </div>
  )
}
