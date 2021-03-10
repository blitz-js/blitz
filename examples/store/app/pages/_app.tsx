import {queryClient, AppProps, ErrorComponent} from "blitz"
import {ErrorBoundary} from "react-error-boundary"
import {QueryClient, QueryClientProvider, useQueryErrorResetBoundary} from "react-query"

if (typeof window !== "undefined") {
  window["DEBUG_BLITZ"] = 1
}

export default function App({Component, pageProps}: AppProps) {
  const {reset} = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback} onReset={reset}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

function RootErrorFallback({error, resetErrorBoundary}) {
  return <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
}
