import { withBlitz } from "app/blitz-client";
import { useQueryErrorResetBoundary } from "@blitzjs/rpc";
import { AppProps, ErrorBoundary, ErrorComponent } from "@blitzjs/next";

if (typeof window !== "undefined") {
  window["DEBUG_BLITZ"] = 1
}

export default withBlitz(function App({Component, pageProps}: AppProps) {
  const {reset} = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback} onReset={reset}>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
});

function RootErrorFallback({error, resetErrorBoundary}) {
  return <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
}
