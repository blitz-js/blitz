import { AppProps, ErrorComponent } from "blitz"
import { ErrorBoundary } from "react-error-boundary"
import { queryCache } from "react-query"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      onReset={() => {
        // This ensures the Blitz useQuery hooks will automatically refetch
        // data any time you reset the error boundary
        queryCache.resetErrorBoundaries()
      }}
    >
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

function RootErrorFallback({ error, resetErrorBoundary }) {
  return <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
}
