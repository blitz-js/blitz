import {
  AppProps,
  ErrorBoundary,
  ErrorComponent,
  AuthenticationError,
  AuthorizationError,
  ErrorFallbackProps,
  useQueryErrorResetBoundary,
} from "blitz"
import LoginForm from "app/auth/components/LoginForm"
import {ReactQueryDevtools} from "react-query/devtools"

export default function App({Component, pageProps}: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)
  const {reset} = useQueryErrorResetBoundary()

  return (
    <>
      <ErrorBoundary FallbackComponent={RootErrorFallback} onReset={reset}>
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
      <ReactQueryDevtools />
    </>
  )
}

function RootErrorFallback({error, resetErrorBoundary}: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <LoginForm onSuccess={resetErrorBoundary} />
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    )
  }
}
