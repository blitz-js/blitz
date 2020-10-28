import {
  AppProps,
  BlitzError,
  ErrorComponent,
  isAuthenticationError,
  isAuthorizationError,
  useRouter,
} from "blitz"
import {ErrorBoundary, FallbackProps} from "react-error-boundary"
import {queryCache} from "react-query"
import LoginForm from "app/auth/components/LoginForm"

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

function RootErrorFallback({error, resetErrorBoundary}: FallbackProps) {
  if (isAuthenticationError(error)) {
    return <LoginForm onSuccess={resetErrorBoundary} />
  } else if (isAuthorizationError(error)) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as BlitzError)?.statusCode || 400}
        title={(error as BlitzError)?.message || (error as BlitzError)?.name}
      />
    )
  }
}
