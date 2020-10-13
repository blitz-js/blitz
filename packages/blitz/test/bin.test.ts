import spawn from "cross-spawn"

describe("Binary blitz", () => {
  it("should return exit code 0 if command is successfull", () => {
    const result = spawn.sync("blitz", ["--version"])
    expect(result.status).toBe(0)
  })
  it.skip("should return exit code 1 if command is unsuccessfull", () => {
    // TODO: Commands not available dont return exit code 1.
    // Need do setup a environment to get it failing.

    const result = spawn.sync("blitz", ["notAvailableCommand"])
    expect(result.status).toBe(1)
  })
})
