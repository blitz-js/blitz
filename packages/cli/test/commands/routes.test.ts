import {Routes} from "../../src/commands/routes"

const routes = jest.fn(() => {
  return []
})
jest.mock("@blitzjs/server", () => ({routes}))

describe("Routes command", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("runs the routes script", async () => {
    await Routes.run([])
    expect(routes).toBeCalled()
  })
})
