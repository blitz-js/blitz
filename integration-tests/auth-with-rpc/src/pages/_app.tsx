import {withBlitz} from "../blitz-client"
import {useQueryErrorResetBoundary} from "@blitzjs/rpc"
import {AppProps, ErrorBoundary, ErrorFallbackProps} from "@blitzjs/next"

if (typeof window !== "undefined") {
  ;(window as any).DEBUG_BLITZ = 1
}

export default withBlitz(function App({Component, pageProps}: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <ErrorBoundary
      FallbackComponent={RootErrorFallback}
      onReset={useQueryErrorResetBoundary().reset}
    >
      {getLayout(<Component {...pageProps} />)}
    </ErrorBoundary>
  )
})

function RootErrorFallback({error}: ErrorFallbackProps) {
  return (
    <div>
      <div id="error">{error.name}</div>
      {error.statusCode} {error.message}
    </div>
  )
}
