import LoginForm from "app/modules/auth/components/LoginForm"
import {AppProps, ErrorComponent, useRouter} from "blitz"
import {ErrorBoundary} from "react-error-boundary"
import {queryCache} from "react-query"

if (typeof window !== "undefined") {
  window["DEBUG_BLITZ"] = 1
}

export default function App({Component, pageProps}: AppProps) {
  const router = useRouter()
  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      resetKeys={[router.asPath]}
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

function RootErrorFallback({error, resetErrorBoundary}) {
  if (error.name === "AuthenticationError") {
    return <LoginForm onSuccess={resetErrorBoundary} />
  } else if (error.name === "AuthorizationError") {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
    )
  }
}
