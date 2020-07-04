import React from "react"
import {queryCache} from "react-query"
import LoginForm from "app/components/LoginForm"

export default class ErrorBoundary extends React.Component<{
  fallback?: (error: any) => React.ReactNode
}> {
  state = {hasError: false, error: null}

  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
      error,
    }
  }

  reset = () => {
    this.setState({hasError: false, error: null})
    queryCache.resetErrorBoundaries()
  }

  render() {
    const {hasError, error} = this.state
    if (hasError) {
      if (error.name === "AuthenticationError") {
        return <LoginForm onSuccess={this.reset} />
      } else if (error.name === "AuthorizationError") {
        alert("AuthorizationError")
        return <h1>You are not allow to access this resource</h1>
      } else if (this.props.fallback) {
        return this.props.fallback(error)
      } else {
        throw error
      }
    }
    return this.props.children
  }
}
