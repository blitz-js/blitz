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
    if (this.state.hasError) {
      if (this.state.error.name === "AuthorizationError") {
        return <LoginForm />
      } else if (this.props.fallback) {
        return this.props.fallback(this.state.error)
      } else {
        throw this.state.error
      }
    }
    return this.props.children
  }
}
