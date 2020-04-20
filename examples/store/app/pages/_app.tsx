import ErrorBoundary from 'app/components/ErrorBoundary'

export default function MyApp({Component, pageProps}) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div>
          <h1>Unhandled Error</h1>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}
