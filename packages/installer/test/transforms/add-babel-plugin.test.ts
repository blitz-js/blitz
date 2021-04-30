import {addBabelPlugin, customTsParser} from "@blitzjs/installer"
import j from "jscodeshift"

function executeBabelPlugin(fileStr: string, plugin: string | [string, Object]): string {
  return addBabelPlugin(j(fileStr, {parser: customTsParser}), plugin).toSource()
}

describe("addBabelPlugin transform", () => {
  it("adds babel plugin literal", () => {
    const source = `module.exports = {
      presets: ["@babel/preset-typescript"],
      plugins: [],
    }`

    expect(executeBabelPlugin(source, "@emotion")).toMatchSnapshot()
  })

  it("adds babel plugin array", () => {
    const source = `module.exports = {
      presets: ["@babel/preset-typescript"],
      plugins: [],
    }`

    expect(
      executeBabelPlugin(source, ["@babel/plugin-proposal-decorators", {legacy: true}]),
    ).toMatchSnapshot()
  })
})
