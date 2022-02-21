import type {AppProps} from "next/app"
import React from "react"
import {withBlitz} from "../src/client-setup"

function MyApp({Component, pageProps}: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

export default withBlitz(MyApp)

class ErrorBoundary extends React.Component<{}, {hasError: boolean; error?: string}> {
  constructor(props) {
    super(props)
    this.state = {hasError: false}
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error: error.toString()}
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <p>{this.state.error}</p>
        </div>
      )
    }

    return this.props.children
  }
}
