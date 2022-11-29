/**
 * @vitest-environment jsdom
 */

import {afterEach, beforeEach, test, expect, MockedFunction, vi} from "vitest"
import {render, screen, cleanup, waitFor} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import type {ErrorFallbackProps} from "./error-boundary"
import {ErrorBoundary, useErrorHandler} from "./error-boundary"

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true
  vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
  cleanup()
})

function ErrorFallback({error, resetErrorBoundary}: ErrorFallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

const firstLine = (str: string) => str.split("\n")[0]

test("handleError forwards along async errors", async () => {
  function AsyncBomb() {
    const [explode, setExplode] = React.useState(false)
    const handleError = useErrorHandler()
    React.useEffect(() => {
      if (explode) {
        setTimeout(() => {
          handleError(new Error("💥 CABOOM 💥"))
        })
      }
    })
    return <button onClick={() => setExplode(true)}>bomb</button>
  }
  const {unmount} = render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AsyncBomb key={"test-2"} />
    </ErrorBoundary>,
  )

  userEvent.click(screen.getByRole("button", {name: /bomb/i}))

  await waitFor(async () => {
    await screen.findByRole("alert")

    const consoleError = console.error as MockedFunction<(args: unknown[]) => void>
    // TODO - renable
    //   const [[actualError], [componentStack]] = consoleError.mock.calls
    //   const firstLineOfError = firstLine(actualError as string)
    //   expect(firstLineOfError).toMatchInlineSnapshot(`"Error: Uncaught [Error: 💥 CABOOM 💥]"`)
    //   expect(cleanStack(componentStack)).toMatchInlineSnapshot(`
    //   "The above error occurred in the <AsyncBomb> component:
    //
    //       at AsyncBomb
    //       at ErrorBoundary
    //
    //   React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary."
    // `)
    expect(consoleError).toHaveBeenCalledTimes(3)
    consoleError.mockClear()

    // can recover
    userEvent.click(screen.getByRole("button", {name: /try again/i}))
    expect(console.error).not.toHaveBeenCalled()
    unmount()
  })
})

test("can pass an error to useErrorHandler", async () => {
  function AsyncBomb() {
    const [error, setError] = React.useState<Error | null>(null)
    const [explode, setExplode] = React.useState(false)
    useErrorHandler(error)
    React.useEffect(() => {
      if (explode) {
        setTimeout(() => {
          setError(new Error("💥 CABOOM 💥"))
        })
      }
    })
    return <button onClick={() => setExplode(true)}>bomb 2</button>
  }
  const {unmount} = render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AsyncBomb key={"test-2"} />
    </ErrorBoundary>,
  )
  userEvent.click(screen.getByRole("button", {name: /bomb 2/i}))

  await screen.findByRole("alert")

  const consoleError = console.error as MockedFunction<(args: unknown[]) => void>
  // TODO - renable
  // const [[actualError], [componentStack]] = consoleError.mock.calls
  // const firstLineOfError = firstLine(actualError as string)
  // expect(firstLineOfError).toMatchInlineSnapshot(`"Error: Uncaught [Error: 💥 CABOOM 💥]"`)
  //   expect(cleanStack(componentStack)).toMatchInlineSnapshot(`
  //   "The above error occurred in the <AsyncBomb> component:
  //
  //       at AsyncBomb
  //       at ErrorBoundary
  //
  //   React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary."
  // `)
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  // can recover
  userEvent.click(screen.getByRole("button", {name: /try again/i}))
  expect(console.error).not.toHaveBeenCalled()
  unmount()
})
