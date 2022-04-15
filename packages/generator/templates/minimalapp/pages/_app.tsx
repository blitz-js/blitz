import { ErrorFallbackProps, ErrorComponent, ErrorBoundary } from "@blitzjs/next"
import type { AppProps } from "next/app"
import React from "react"
import { withBlitz } from "app/blitz-client"

function RootErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <ErrorComponent
      statusCode={(error as any)?.statusCode || 400}
      title={error.message || error.name}
    />
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

export default withBlitz(MyApp)
