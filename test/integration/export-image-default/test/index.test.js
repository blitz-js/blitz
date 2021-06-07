/* eslint-env jest */

import fs from "fs-extra"
import {blitzBuild, blitzExport} from "lib/blitz-test-utils"
import {join} from "path"

jest.setTimeout(1000 * 60 * 5)
const appDir = join(__dirname, "../")
const outdir = join(appDir, "out")

describe("Export with default loader image component", () => {
  it("should build successfully", async () => {
    await fs.remove(join(appDir, ".next"))
    const {code} = await blitzBuild(appDir)
    if (code !== 0) throw new Error(`build failed with status ${code}`)
  })

  it("should have error during blitzx export", async () => {
    const {stderr} = await blitzExport(appDir, {outdir}, {stderr: true})
    expect(stderr).toContain(
      "Image Optimization using Next.js' default loader is not compatible with `next export`.",
    )
  })
})
