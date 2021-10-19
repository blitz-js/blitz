import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import type { ErrorFallbackProps } from 'next/stdlib'
import { ErrorBoundary, useErrorHandler } from 'next/stdlib'
import { cleanStack } from './error-boundary.unit.test'

afterEach(() => {
  jest.resetAllMocks()
  jest.restoreAllMocks()
})

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

// afterEach(() => {
//   try {
//     expect(console.error).not.toHaveBeenCalled()
//   } catch (e) {
//     throw new Error(
//       `console.error was called unexpectedly (make sure to assert all calls and console.error.mockClear() at the end of the test)`,
//     )
//   }
// })

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

const firstLine = (str: string) => str.split('\n')[0]

test('handleError forwards along async errors', async () => {
  function AsyncBomb() {
    const [explode, setExplode] = React.useState(false)
    const handleError = useErrorHandler()
    React.useEffect(() => {
      if (explode) {
        setTimeout(() => {
          handleError(new Error('💥 CABOOM 💥'))
        })
      }
    })
    return <button onClick={() => setExplode(true)}>bomb</button>
  }
  render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AsyncBomb />
    </ErrorBoundary>
  )

  userEvent.click(screen.getByRole('button', { name: /bomb/i }))

  await screen.findByRole('alert')

  const consoleError = console.error as jest.Mock<void, unknown[]>
  const [[actualError], [componentStack]] = consoleError.mock.calls
  const firstLineOfError = firstLine(actualError as string)
  expect(firstLineOfError).toMatchInlineSnapshot(
    `"Error: Uncaught [Error: 💥 CABOOM 💥]"`
  )
  expect(cleanStack(componentStack)).toMatchInlineSnapshot(`
"The above error occurred in the <AsyncBomb> component:

    at AsyncBomb 
    at ErrorBoundary 

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary."
`)
  expect(consoleError).toHaveBeenCalledTimes(2)
  consoleError.mockClear()

  // can recover
  userEvent.click(screen.getByRole('button', { name: /try again/i }))
  expect(console.error).not.toHaveBeenCalled()
})

test('can pass an error to useErrorHandler', async () => {
  function AsyncBomb() {
    const [error, setError] = React.useState<Error | null>(null)
    const [explode, setExplode] = React.useState(false)
    useErrorHandler(error)
    React.useEffect(() => {
      if (explode) {
        setTimeout(() => {
          setError(new Error('💥 CABOOM 💥'))
        })
      }
    })
    return <button onClick={() => setExplode(true)}>bomb</button>
  }
  render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AsyncBomb />
    </ErrorBoundary>
  )

  userEvent.click(screen.getByRole('button', { name: /bomb/i }))

  await screen.findByRole('alert')

  const consoleError = console.error as jest.Mock<void, unknown[]>
  const [[actualError], [componentStack]] = consoleError.mock.calls
  const firstLineOfError = firstLine(actualError as string)
  expect(firstLineOfError).toMatchInlineSnapshot(
    `"Error: Uncaught [Error: 💥 CABOOM 💥]"`
  )
  expect(cleanStack(componentStack)).toMatchInlineSnapshot(`
"The above error occurred in the <AsyncBomb> component:

    at AsyncBomb 
    at ErrorBoundary 

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary."
`)
  expect(consoleError).toHaveBeenCalledTimes(2)
  consoleError.mockClear()

  // can recover
  userEvent.click(screen.getByRole('button', { name: /try again/i }))
  expect(console.error).not.toHaveBeenCalled()
})
