import login from "app/mutations/login"
import {AppProps, ErrorFallbackProps, useMutation, useQueryErrorResetBoundary} from "blitz"
import {useRouter} from "next/router"
import {ErrorBoundary} from "react-error-boundary"
import {ReactQueryDevtools} from "react-query/devtools"

export default function App({Component, pageProps}: AppProps) {
  const router = useRouter()

  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      resetKeys={[router.asPath]}
      onReset={useQueryErrorResetBoundary().reset}
    >
      <Component {...pageProps} />
      <ReactQueryDevtools />
    </ErrorBoundary>
  )
}

function RootErrorFallback({error}: ErrorFallbackProps) {
  const [loginMutation] = useMutation(login)
  return (
    <div>
      <div id="error">{error.name}</div>

      <button
        id="login"
        onClick={async () => {
          await loginMutation()
        }}
      >
        login
      </button>
    </div>
  )
}
