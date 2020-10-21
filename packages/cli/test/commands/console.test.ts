import {Console} from "../../src/commands/console"
import * as path from "path"

import * as repl from "@blitzjs/repl"
import * as db from "../../src/commands/db"

jest.spyOn(global.console, "log").mockImplementation()

jest.mock(
  "@blitzjs/server",
  jest.fn(() => {
    return {
      log: {
        branded: jest.fn(),
        spinner: () => {
          return {
            start: jest.fn().mockImplementation(() => ({succeed: jest.fn()})),
          }
        },
      },
    }
  }),
)

jest.mock("../../package.json", () => ({
  dependencies: {
    ramda: "1.0.0",
  },
}))

jest.mock(
  "@blitzjs/repl",
  jest.fn(() => {
    return {
      runRepl: jest.fn(),
    }
  }),
)

describe("Console command", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("runs repl", async () => {
    await Console.run()
    expect(repl.runRepl).toHaveBeenCalled()
  })

  it("runs repl with replOptions", async () => {
    await Console.run()
    expect(repl.runRepl).toHaveBeenCalledWith(Console.replOptions)
  })
})
