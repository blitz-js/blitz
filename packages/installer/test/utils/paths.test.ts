import {paths} from "@blitzjs/installer"
import * as fs from "fs-extra"

describe("path utils", () => {
  it("returns proper file paths", () => {
    // ---------------
    // IN A TS PROJECT
    // ---------------
    jest.spyOn(fs, "existsSync").mockReturnValue(true)
    expect(paths.document()).toBe("app/pages/_document.tsx")
    expect(paths.app()).toBe("app/pages/_app.tsx")
    expect(paths.entry()).toBe("app/pages/index.tsx")
    // blitz config is always JS, we shouldn't transform this extension
    expect(paths.blitzConfig()).toBe("blitz.config.js")

    // ---------------
    // IN A JS PROJECT
    // ---------------
    jest.spyOn(fs, "existsSync").mockReturnValue(false)
    expect(paths.document()).toBe("app/pages/_document.js")
    expect(paths.app()).toBe("app/pages/_app.js")
    expect(paths.entry()).toBe("app/pages/index.js")
    expect(paths.blitzConfig()).toBe("blitz.config.js")
  })
})
