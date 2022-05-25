import {expect, describe, it} from "vitest"
import spawn from "cross-spawn"

describe("codemod cli", () => {
  it("errors without codemod name", async () => {
    const run = spawn.sync("bin/@blitzjs/codemod", [], {stdio: "pipe"})
    expect(run.stdout.toString()).toContain("Codemod not found")
  })
})
