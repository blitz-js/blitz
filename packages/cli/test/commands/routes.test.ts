const routes = jest.fn(() => {
  return []
})
jest.mock("@blitzjs/server", () => ({routes, resolveBinAsync: jest.fn()}))

let onSpy: jest.Mock
const spawn = jest.fn(() => {
  onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
    callback(0)
  })
  return {on: onSpy, off: jest.fn()}
})

jest.doMock("cross-spawn", () => ({spawn}))

import {Routes} from "../../src/commands/routes"

describe("Routes command", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("runs the routes script", async () => {
    await Routes.run([])
    expect(routes).toBeCalled()
  })
})
