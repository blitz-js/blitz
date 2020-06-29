import React from "react"
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

  render() {
    const {hasError, error} = this.state
    if (hasError) {
      if (error.name === "AuthenticationError") {
        return <LoginForm />
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
