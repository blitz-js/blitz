import {ErrorFallbackProps, ErrorComponent, ErrorBoundary, AppProps} from "@blitzjs/next"
import {AuthenticationError, AuthorizationError} from "blitz"
import React, {Suspense} from "react"
import {withBlitz} from "../app/blitz-client"

function RootErrorFallback({error}: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>
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

function MyApp({Component, pageProps}: AppProps) {
  return (
    <Suspense fallback="Loading...">
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        <Component {...pageProps} />
      </ErrorBoundary>
    </Suspense>
  )
}

export default withBlitz(MyApp)
