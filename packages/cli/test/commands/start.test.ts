const dev = jest.fn(() => {})
const prod = jest.fn(() => {})

jest.mock("@blitzjs/server", () => ({dev, prod, resolveBinAsync: jest.fn()}))

let onSpy: jest.Mock
const spawn = jest.fn(() => {
  onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
    callback(0)
  })
  return {on: onSpy}
})

jest.doMock("cross-spawn", () => ({spawn}))

import {Start} from "../../src/commands/start"

describe("Start command", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("runs the dev script", async () => {
    await Start.run([])
    expect(dev).toBeCalled()
  })

  it("runs the prod script when passed the production flag", async () => {
    await Start.run(["--production"])
    expect(prod).toBeCalled()
  })
})
