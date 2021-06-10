import {AppProps, ErrorFallbackProps, useQueryErrorResetBoundary} from "blitz"
import {useRouter} from "next/router"
import {ErrorBoundary} from "react-error-boundary"
import {ReactQueryDevtools} from "react-query/devtools"

if (typeof window !== "undefined") {
  ;(window as any).DEBUG_BLITZ = 1
}

export default function App({Component, pageProps}: AppProps) {
  const router = useRouter()

  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      resetKeys={[router.asPath]}
      onReset={useQueryErrorResetBoundary().reset}
      // onError={(error: any) => {
      //   if (error.name === "RedirectError") {
      //     console.log("[RedirectError] - router .push")
      //     router.push(error.href)
      //   }
      // }}
    >
      <Component {...pageProps} />
      <ReactQueryDevtools />
    </ErrorBoundary>
  )
}

function RootErrorFallback({error}: ErrorFallbackProps) {
  const router = useRouter()
  if (error.name === "RedirectError") {
    console.log("[RedirectError] - router .push")
    router.push(error.href)
    return null
  }
  return <div id="error">{error.name}</div>
}
