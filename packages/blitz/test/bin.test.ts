import spawn from "cross-spawn"
import path from "path"

const blitzBin = path.resolve(__dirname, "../bin/blitz")
const exampleProject = path.resolve(__dirname, "../../../examples/auth")

describe("Binary blitz", () => {
  it("should return exit code 0 if command is successful", () => {
    const result = spawn.sync(blitzBin, ["--version"], {
      cwd: exampleProject,
    })
    expect(result.status).toBe(0)
  })
  it("should return exit code 1 if command is unsuccessful", () => {
    const result = spawn.sync(blitzBin, ["install", "notExistingRecipe"], {
      cwd: exampleProject,
    })
    expect(result.status).toBe(1)
  })
})
