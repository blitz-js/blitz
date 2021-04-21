import {paths} from "@blitzjs/installer"
import * as fs from "fs-extra"

jest.mock("fs-extra")

const testIfNotWindows = process.platform === "win32" ? test.skip : test

describe("path utils", () => {
  it("returns proper file paths in a TS project", () => {
    fs.existsSync.mockReturnValue(true)
    expect(paths.document()).toBe("app/pages/_document.tsx")
    expect(paths.app()).toBe("app/pages/_app.tsx")
    expect(paths.entry()).toBe("app/pages/index.tsx")
    // Blitz and Babel configs are always JS, we shouldn't transform this extension
    expect(paths.blitzConfig()).toBe("blitz.config.ts")
    expect(paths.babelConfig()).toBe("babel.config.js")
  })

  // SKIP test because the fs mock is failing on windows
  testIfNotWindows("returns proper file paths in a JS project", () => {
    fs.existsSync.mockReturnValue(false)
    expect(paths.document()).toBe("app/pages/_document.js")
    expect(paths.app()).toBe("app/pages/_app.js")
    expect(paths.entry()).toBe("app/pages/index.js")
    expect(paths.blitzConfig()).toBe("blitz.config.js")
    expect(paths.babelConfig()).toBe("babel.config.js")
  })
})
