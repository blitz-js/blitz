import {patternRelativeImportSingle} from "."
describe("patternRelativeImport", () => {
  it("matches an import statement", () => {
    const matches = `import "./bar/baz"`.match(patternRelativeImportSingle)

    expect(matches && matches[2]).toEqual("./bar/baz")
  })

  it("matches a multiline import statement", () => {
    const input = `import {
  foo,
  bar
} from "./ding"`
    const matches = input.match(patternRelativeImportSingle)

    expect(matches && matches[2]).toEqual("./ding")
  })

  it("matches an import statement with no specifier", () => {
    const input = `import "./ding"`
    const matches = input.match(patternRelativeImportSingle)

    expect(matches && matches[2]).toEqual("./ding")
  })

  it("matches a dynamic import statement", () => {
    const input = `import("../bar/baz")`
    const matches = input.match(patternRelativeImportSingle)

    expect(matches && matches[2]).toEqual("../bar/baz")
  })
})
