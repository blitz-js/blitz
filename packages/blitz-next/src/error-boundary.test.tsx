/**
 * @vitest-environment jsdom
 */

import {
  expect,
  describe,
  it,
  test,
  afterEach,
  beforeEach,
  spyOn,
  MockWithArgs,
  vi,
  MockedFunction,
} from "vitest"
import {render, screen, cleanup} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React, {forwardRef} from "react"
import type {ErrorFallbackProps} from "./error-boundary"
import {ErrorBoundary, withErrorBoundary} from "./error-boundary"

beforeEach(() => {
  ;(global as any).IS_REACT_ACT_ENVIRONMENT = true
  spyOn(console, "error").mockImplementation(() => {})
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

function Bomb() {
  throw new Error("💥 CABOOM 💥")
  // eslint-disable-next-line
  return null
}

const firstLine = (str: string) => str.split("\n")[0]

export const cleanStack = (stack: any): any => {
  if (typeof stack === "string") {
    return stack.replace(/\(.*\)/g, "")
  }
  if (typeof stack === "object" && stack.componentStack) {
    stack.componentStack = cleanStack(stack.componentStack)
    return stack
  }
  return stack
}

test("standard use-case", () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>

  function App() {
    const [username, setUsername] = React.useState("")
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setUsername(e.target.value)
    }
    return (
      <div>
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" onChange={handleChange} />
        </div>
        <div>{username === "fail" ? "Oh no" : "things are good"}</div>
        <div>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {username === "fail" ? <Bomb /> : 'type "fail"'}
          </ErrorBoundary>
        </div>
      </div>
    )
  }

  const {unmount} = render(<App />)

  userEvent.type(screen.getByRole("textbox", {name: /username/i}), "fail")

  const [[actualError], [componentStack]] = consoleError.mock.calls
  expect(firstLine(actualError as string)).toMatchInlineSnapshot(
    `"Error: Uncaught [Error: 💥 CABOOM 💥]"`,
  )
  expect(cleanStack(componentStack)).toMatchInlineSnapshot(`
    "Error: Uncaught [Error: 💥 CABOOM 💥]
        at reportException 
        at innerInvokeEventListeners 
        at invokeEventListeners 
        at HTMLUnknownElementImpl._dispatch 
        at HTMLUnknownElementImpl.dispatchEvent 
        at HTMLUnknownElement.dispatchEvent 
        at Object.invokeGuardedCallbackDev 
        at invokeGuardedCallback 
        at beginWork\$1 
        at performUnitOfWork "
  `)
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  expect(screen.getByRole("alert")).toMatchInlineSnapshot(`
    <div
      role="alert"
    >
      <p>
        Something went wrong:
      </p>
      <pre>
        💥 CABOOM 💥
      </pre>
      <button>
        Try again
      </button>
    </div>
  `)

  // can recover from errors when the component is rerendered and reset is clicked
  userEvent.type(screen.getByRole("textbox", {name: /username/i}), "-not")
  userEvent.click(screen.getByRole("button", {name: /try again/i}))
  expect(screen.queryByRole("alert")).toBeNull()
  unmount()
})

test("fallbackRender prop", () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>

  const workingMessage = "Phew, we are safe!"

  function App() {
    const [explode, setExplode] = React.useState(true)
    return (
      <div>
        <ErrorBoundary
          fallbackRender={({resetErrorBoundary}) => (
            <button
              onClick={() => {
                setExplode(false)
                resetErrorBoundary()
              }}
            >
              Try again
            </button>
          )}
        >
          {explode ? <Bomb /> : workingMessage}
        </ErrorBoundary>
      </div>
    )
  }

  const {unmount} = render(<App />)
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  // the render prop API allows a single action to reset the app state
  // as well as reset the ErrorBoundary state
  userEvent.click(screen.getByRole("button", {name: /try again/i}))
  expect(screen.getByText(workingMessage)).to.exist
  unmount()
})

test("simple fallback is supported", () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>

  const {unmount} = render(
    <ErrorBoundary fallback={<div>Oh no</div>}>
      <Bomb />
      <span>child</span>
    </ErrorBoundary>,
  )
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()
  expect(screen.getByText(/oh no/i)).to.exist
  expect(screen.queryByText(/child/i)).to.not.exist
  unmount()
})

test("withErrorBoundary HOC", () => {
  const consoleError = console.error as MockedFunction<(args: unknown[]) => void>

  const onErrorHandler = vi.fn()
  const Boundary = withErrorBoundary(
    () => {
      throw new Error("💥 CABOOM 💥")
    },
    {FallbackComponent: ErrorFallback, onError: onErrorHandler},
  )
  const {unmount} = render(<Boundary />)

  const [[actualError], [componentStack]] = consoleError.mock.calls
  const firstLineOfError = firstLine(actualError as string)
  expect(firstLineOfError).toMatchInlineSnapshot(`"Error: Uncaught [Error: 💥 CABOOM 💥]"`)
  expect(cleanStack(componentStack)).toMatchInlineSnapshot(`
    "Error: Uncaught [Error: 💥 CABOOM 💥]
        at reportException 
        at innerInvokeEventListeners 
        at invokeEventListeners 
        at HTMLUnknownElementImpl._dispatch 
        at HTMLUnknownElementImpl.dispatchEvent 
        at HTMLUnknownElement.dispatchEvent 
        at Object.invokeGuardedCallbackDev 
        at invokeGuardedCallback 
        at beginWork\$1 
        at performUnitOfWork "
  `)
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  const [error, onErrorComponentStack] = (onErrorHandler.mock.calls as [[Error, string]])[0]
  expect(error.message).toMatchInlineSnapshot(`"💥 CABOOM 💥"`)
  expect(cleanStack(onErrorComponentStack)).toMatchInlineSnapshot(`
    {
      "componentStack": "
        at __vite_ssr_import_4__.withErrorBoundary.FallbackComponent 
        at ErrorBoundary 
        at withErrorBoundary",
    }
  `)
  expect(onErrorHandler).toHaveBeenCalledTimes(1)
  unmount()
})

test("supported but undocumented reset method", () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>

  const children = "Boundry children"
  function App() {
    const errorBoundaryRef = React.useRef<ErrorBoundary | null>(null)
    const [explode, setExplode] = React.useState(false)
    return (
      <>
        <button onClick={() => setExplode(true)}>explode</button>
        <button
          onClick={() => {
            setExplode(false)
            errorBoundaryRef.current?.resetErrorBoundary()
          }}
        >
          recover
        </button>
        <ErrorBoundary ref={errorBoundaryRef} FallbackComponent={ErrorFallback}>
          {explode ? <Bomb /> : children}
        </ErrorBoundary>
      </>
    )
  }
  const {unmount} = render(<App />)
  userEvent.click(screen.getByText("explode"))

  expect(screen.queryByText(children)).not.exist
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  userEvent.click(screen.getByText("recover"))
  expect(screen.getByText(children)).to.exist
  expect(consoleError).toHaveBeenCalledTimes(0)
  unmount()
})

test("requires either a fallback, fallbackRender, or FallbackComponent", () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>

  let unmount: undefined | (() => void)
  expect(() => {
    const result = render(
      // @ts-expect-error we're testing the runtime check of missing props here
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    unmount = result.unmount
  }).toThrowErrorMatchingInlineSnapshot(
    `"<ErrorBoundary> requires either a fallback, fallbackRender, or FallbackComponent prop"`,
  )
  consoleError.mockClear()
  unmount?.()
})

// eslint-disable-next-line max-statements
test("supports automatic reset of error boundary when resetKeys change", () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>

  const handleReset = vi.fn()
  const TRY_AGAIN_ARG1 = "TRY_AGAIN_ARG1"
  const TRY_AGAIN_ARG2 = "TRY_AGAIN_ARG2"
  const handleResetKeysChange = vi.fn()
  function App() {
    const [explode, setExplode] = React.useState(false)
    const [extra, setExtra] = React.useState(false)
    return (
      <div>
        <button onClick={() => setExplode((e) => !e)}>toggle explode</button>
        <ErrorBoundary
          fallbackRender={({resetErrorBoundary}) => (
            <div role="alert">
              <button onClick={() => resetErrorBoundary(TRY_AGAIN_ARG1, TRY_AGAIN_ARG2)}>
                Try again
              </button>
              <button onClick={() => setExtra((e) => !e)}>toggle extra resetKey</button>
            </div>
          )}
          onReset={(...args) => {
            setExplode(false)
            handleReset(...args)
          }}
          onResetKeysChange={handleResetKeysChange}
          resetKeys={extra ? [explode, extra] : [explode]}
        >
          {explode || extra ? <Bomb /> : null}
        </ErrorBoundary>
      </div>
    )
  }
  const {unmount} = render(<App />)

  // blow it up
  userEvent.click(screen.getByText("toggle explode"))
  expect(screen.getByRole("alert")).to.exist
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  // recover via try again button
  userEvent.click(screen.getByText(/try again/i))
  expect(screen.queryByRole("alert")).to.not.exist
  expect(consoleError).not.toHaveBeenCalled()
  expect(handleReset).toHaveBeenCalledWith(TRY_AGAIN_ARG1, TRY_AGAIN_ARG2)
  expect(handleReset).toHaveBeenCalledTimes(1)
  handleReset.mockClear()
  expect(handleResetKeysChange).not.toHaveBeenCalled()

  // blow it up again
  userEvent.click(screen.getByText("toggle explode"))
  expect(screen.getByRole("alert")).to.exist
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  // recover via resetKeys change
  userEvent.click(screen.getByText("toggle explode"))
  expect(handleResetKeysChange).toHaveBeenCalledWith([true], [false])
  expect(handleResetKeysChange).toHaveBeenCalledTimes(1)
  handleResetKeysChange.mockClear()
  expect(handleReset).not.toHaveBeenCalled()
  expect(screen.queryByRole("alert")).not.exist
  expect(consoleError).not.toHaveBeenCalled()

  // blow it up again
  userEvent.click(screen.getByText("toggle explode"))
  expect(screen.getByRole("alert")).to.exist
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  // toggles adding an extra resetKey to the array
  // expect error to re-render
  userEvent.click(screen.getByText("toggle extra resetKey"))
  expect(handleResetKeysChange).toHaveBeenCalledTimes(1)
  expect(handleResetKeysChange).toHaveBeenCalledWith([true], [true, true])
  handleResetKeysChange.mockClear()
  expect(screen.getByRole("alert")).to.exist
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  // toggle explode back to false
  // expect error to re-render again
  userEvent.click(screen.getByText("toggle explode"))
  expect(handleReset).not.toHaveBeenCalled()
  expect(handleResetKeysChange).toHaveBeenCalledTimes(1)
  expect(handleResetKeysChange).toHaveBeenCalledWith([true, true], [false, true])
  expect(screen.getByRole("alert")).to.exist
  handleResetKeysChange.mockClear()
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  // toggle extra resetKey
  // expect error to be reset
  userEvent.click(screen.getByText("toggle extra resetKey"))
  expect(handleReset).not.toHaveBeenCalled()
  expect(handleResetKeysChange).toHaveBeenCalledTimes(1)
  expect(handleResetKeysChange).toHaveBeenCalledWith([false, true], [false])
  handleResetKeysChange.mockClear()
  expect(screen.queryByRole("alert")).not.exist
  expect(consoleError).not.toHaveBeenCalled()

  unmount()
})

test("supports reset via resetKeys right after error is triggered on component mount", async () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>
  const handleResetKeysChange = vi.fn()
  function App() {
    const [explode, setExplode] = React.useState(true)
    return (
      <div>
        <button onClick={() => setExplode((e) => !e)}>toggle explode</button>
        <ErrorBoundary
          fallbackRender={() => (
            <div role="alert">
              <p>Something went wrong</p>
            </div>
          )}
          onResetKeysChange={handleResetKeysChange}
          resetKeys={[explode]}
        >
          {explode ? <Bomb /> : null}
        </ErrorBoundary>
      </div>
    )
  }
  const {unmount} = render(<App />)

  // it blows up on render
  expect(screen.queryByRole("alert", {})).to.exist
  expect(consoleError).toHaveBeenCalledTimes(3)
  consoleError.mockClear()

  // recover via "toggle explode" button
  userEvent.click(screen.getByText("toggle explode"))
  expect(screen.queryByRole("alert")).to.not.exist
  expect(consoleError).not.toHaveBeenCalled()
  expect(handleResetKeysChange).toHaveBeenCalledWith([true], [false])
  expect(handleResetKeysChange).toHaveBeenCalledTimes(1)
  unmount()
})

test("should support not only function as FallbackComponent", () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>

  const FancyFallback = forwardRef(({error}: ErrorFallbackProps) => (
    <div>
      <p>Everything is broken. Try again</p>
      <pre>{error.message}</pre>
    </div>
  ))
  FancyFallback.displayName = "FancyFallback"

  function App() {
    return (
      <ErrorBoundary FallbackComponent={FancyFallback}>
        <Bomb />
      </ErrorBoundary>
    )
  }

  const {unmount} = render(<App />)

  expect(screen.getByText("Everything is broken. Try again")).to.exist
  consoleError.mockClear()
  unmount?.()
})

test("should throw error if FallbackComponent is not valid", () => {
  const consoleError = console.error as MockWithArgs<(args: unknown[]) => void>

  let unmount: undefined | (() => void)
  expect(() => {
    const result = render(
      // @ts-expect-error we're testing the error case
      <ErrorBoundary FallbackComponent={{}}>
        <Bomb />
      </ErrorBoundary>,
    )
    unmount = result.unmount
  }).toThrowError(/Element type is invalid/i)

  consoleError.mockClear()
  unmount?.()
})
