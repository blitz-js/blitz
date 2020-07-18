import React from "react"
import {Error as ErrorComponent} from "blitz"
import {queryCache} from "react-query"
import LoginForm from "app/auth/components/LoginForm"

export default class ErrorBoundary extends React.Component<{
  fallback?: (error: any) => React.ReactNode
}> {
  state = {
    error: null as Error | null,
  }

  static getDerivedStateFromError(error: any) {
    return {
      error,
    }
  }

  reset = () => {
    this.setState({error: null})
    queryCache.resetErrorBoundaries()
  }

  render() {
    const {error} = this.state
    if (error) {
      if (error.name === "AuthenticationError") {
        return <LoginForm onSuccess={this.reset} />
      } else if (error.name === "AuthorizationError") {
        return (
          <ErrorComponent
            statusCode={(error as any).statusCode}
            title="Sorry, you are not authorized to access this"
          />
        )
      } else if (this.props.fallback) {
        return this.props.fallback(error)
      } else {
        throw error
      }
    }
    return this.props.children
  }
}
