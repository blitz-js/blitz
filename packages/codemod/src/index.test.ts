import {expect, describe, it} from "vitest"
import spawn from "cross-spawn"

describe("codemod cli", () => {
  it("errors without codemod name", async () => {
    const run = spawn.sync("node", ["dist/index.cjs"], {encoding: "utf8"})
    expect(run.stdout).toContain("Codemod not found")
  })
})
