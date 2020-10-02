import {addImport, customTsParser} from "@blitzjs/installer"
import j from "jscodeshift"

function executeImport(fileStr: string, importStatement: j.ImportDeclaration): string {
  return addImport(j(fileStr, {parser: customTsParser}), importStatement).toSource({tabWidth: 60})
}

describe("addImport transform", () => {
  it("adds import at start of file with no imports present", () => {
    const file = `export const truth = () => 42`
    const importStatement = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier("React"))],
      j.literal("react"),
    )
    expect(executeImport(file, importStatement)).toMatchSnapshot()
  })

  it("adds import at the end of all imports if imports are present", () => {
    const file = `import React from 'react'

export default function Comp() {
  return <div>hello world!</div>
}`
    const importStatement = j.importDeclaration([], j.literal("app/styles/app.css"))
    expect(executeImport(file, importStatement)).toMatchSnapshot()
  })
})
