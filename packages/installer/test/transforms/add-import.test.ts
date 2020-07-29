import {addImport, customTsParser} from "@blitzjs/installer"
import {parse, print, types} from "recast"
import {namedTypes} from "ast-types/gen/namedTypes"

const b = types.builders

function executeImport(
  fileStr: string,
  importStatement: types.namedTypes.ImportDeclaration,
): string {
  return print(
    addImport(
      parse(fileStr, {parser: customTsParser}) as types.namedTypes.File,
      types.builders,
      namedTypes,
      importStatement,
    ) as types.namedTypes.File,
  ).code
}

describe("addImport transform", () => {
  it("adds import at start of file with no imports present", () => {
    const file = `export const truth = () => 42`
    const importStatement = b.importDeclaration(
      [b.importDefaultSpecifier(b.identifier("React"))],
      b.literal("react"),
    )
    expect(executeImport(file, importStatement)).toMatchSnapshot()
  })

  it("adds import at the end of all imports if imports are present", () => {
    const file = `import React from 'react'

export default function Comp() {
  return <div>hello world!</div>
}`
    const importStatement = b.importDeclaration([], b.literal("app/styles/app.css"))
    expect(executeImport(file, importStatement)).toMatchSnapshot()
  })
})
