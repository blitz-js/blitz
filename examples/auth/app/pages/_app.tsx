import {AppProps} from "blitz"
import ErrorBoundary from "app/components/ErrorBoundary"

export default function MyApp({Component, pageProps}: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}
