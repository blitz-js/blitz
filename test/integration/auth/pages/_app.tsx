import {AppProps, ErrorBoundary, ErrorFallbackProps, useQueryErrorResetBoundary} from "blitz"
import {ReactQueryDevtools} from "react-query/devtools"

if (typeof window !== "undefined") {
  ;(window as any).DEBUG_BLITZ = 1
}

export default function App({Component, pageProps}: AppProps) {
  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
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
