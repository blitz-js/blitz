import {RedirectError} from "blitz"
import {Router} from "next/router"
import * as React from "react"
import {RouterContext} from "./router-context"
import _debug from "debug"

const debug = _debug("blitz:errorboundary")

const changedArray = (a: Array<unknown> = [], b: Array<unknown> = []) =>
  a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))

interface ErrorFallbackProps {
  error: Error & Record<any, any>
  resetErrorBoundary: (...args: Array<unknown>) => void
}

interface ErrorBoundaryPropsWithComponent {
  onResetKeysChange?: (
    prevResetKeys: Array<unknown> | undefined,
    resetKeys: Array<unknown> | undefined,
  ) => void
  onReset?: (...args: Array<unknown>) => void
  onError?: (error: Error, info: {componentStack: string}) => void
  resetKeys?: Array<unknown>
  fallback?: never
  FallbackComponent: React.ComponentType<ErrorFallbackProps>
  fallbackRender?: never
}

declare function FallbackRender(
  props: ErrorFallbackProps,
): React.ReactElement<unknown, string | React.FunctionComponent | typeof React.Component> | null

interface ErrorBoundaryPropsWithRender {
  onResetKeysChange?: (
    prevResetKeys: Array<unknown> | undefined,
    resetKeys: Array<unknown> | undefined,
  ) => void
  onReset?: (...args: Array<unknown>) => void
  onError?: (error: Error, info: {componentStack: string}) => void
  resetKeys?: Array<unknown>
  fallback?: never
  FallbackComponent?: never
  fallbackRender: typeof FallbackRender
}

interface ErrorBoundaryPropsWithFallback {
  onResetKeysChange?: (
    prevResetKeys: Array<unknown> | undefined,
    resetKeys: Array<unknown> | undefined,
  ) => void
  onReset?: (...args: Array<unknown>) => void
  onError?: (error: Error, info: {componentStack: string}) => void
  resetKeys?: Array<unknown>
  fallback: React.ReactElement<
    unknown,
    string | React.FunctionComponent | typeof React.Component
  > | null
  FallbackComponent?: never
  fallbackRender?: never
}

type ErrorBoundaryProps =
  | ErrorBoundaryPropsWithFallback
  | ErrorBoundaryPropsWithComponent
  | ErrorBoundaryPropsWithRender

type ErrorBoundaryState = {error: Error | null}

const initialState: ErrorBoundaryState = {error: null}

class ErrorBoundary extends React.Component<
  React.PropsWithRef<React.PropsWithChildren<ErrorBoundaryProps>>,
  ErrorBoundaryState
> {
  static contextType = RouterContext

  static getDerivedStateFromError(error: Error) {
    return {error}
  }

  state = initialState
  updatedWithError = false

  resetErrorBoundary = (...args: Array<unknown>) => {
    this.props.onReset?.(...args)
    this.reset()
  }

  reset() {
    this.updatedWithError = false
    this.setState(initialState)
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (error instanceof RedirectError) {
      debug("Redirecting from ErrorBoundary to", error.url)

      await (this.context as Router)?.push(error.url)
      return
    }
    this.props.onError?.(error, info)
  }

  componentDidMount() {
    const {error} = this.state

    if (error !== null) {
      this.updatedWithError = true
    }

    // Automatically reset on route change
    ;(this.context as Router)?.events?.on("routeChangeComplete", this.handleRouteChange)
  }

  handleRouteChange = () => {
    debug("Resetting error boundary on route change")
    this.props.onReset?.()
    this.reset()
  }

  componentWillUnmount() {
    ;(this.context as Router)?.events?.off("routeChangeComplete", this.handleRouteChange)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const {error} = this.state
    const {resetKeys} = this.props

    // There's an edge case where if the thing that triggered the error
    // happens to *also* be in the resetKeys array, we'd end up resetting
    // the error boundary immediately. This would likely trigger a second
    // error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call
    // of cDU after the error is set
    if (error !== null && !this.updatedWithError) {
      this.updatedWithError = true
      return
    }

    if (error !== null && changedArray(prevProps.resetKeys, resetKeys)) {
      this.props.onResetKeysChange?.(prevProps.resetKeys, resetKeys)
      this.reset()
    }
  }

  render() {
    const {error} = this.state

    const {fallbackRender, FallbackComponent, fallback} = this.props

    if (error !== null) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      }
      if (error instanceof RedirectError) {
        // Don't render children because redirect is imminent
        return null
      } else if (React.isValidElement(fallback)) {
        return fallback
      } else if (typeof fallbackRender === "function") {
        return fallbackRender(props)
      } else if (FallbackComponent) {
        return <FallbackComponent {...props} />
      } else {
        throw new Error(
          "<ErrorBoundary> requires either a fallback, fallbackRender, or FallbackComponent prop",
        )
      }
    }

    return this.props.children
  }
}

function withErrorBoundary<P>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: ErrorBoundaryProps,
): React.ComponentType<P> {
  const Wrapped: React.ComponentType<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  // Format for display in DevTools
  const name = Component.displayName || Component.name || "Unknown"
  Wrapped.displayName = `withErrorBoundary(${name})`

  return Wrapped
}

function useErrorHandler(givenError?: unknown): (error: unknown) => void {
  const [error, setError] = React.useState<unknown>(null)
  if (givenError != null) throw givenError
  if (error != null) throw error
  return setError
}

export {ErrorBoundary, withErrorBoundary, useErrorHandler}
export type {
  ErrorFallbackProps,
  ErrorBoundaryPropsWithComponent,
  ErrorBoundaryPropsWithRender,
  ErrorBoundaryPropsWithFallback,
  ErrorBoundaryProps,
}

/*
eslint
  @typescript-eslint/no-throw-literal: "off",
  @typescript-eslint/prefer-nullish-coalescing: "off"
*/
