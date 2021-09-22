import {AppProps, ErrorBoundary, ErrorComponent, useQueryErrorResetBoundary} from "blitz"

if (typeof window !== "undefined") {
  window["DEBUG_BLITZ"] = 1
}

export default function App({Component, pageProps}: AppProps) {
  const {reset} = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback} onReset={reset}>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

function RootErrorFallback({error, resetErrorBoundary}) {
  return <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
}
