import {Stage, transform} from "@blitzjs/file-pipeline"
import path from "path"
import slash from "slash"

/**
 * Returns a Stage that converts relative files paths to absolute
 */
export const createStageRelative: Stage = ({config: {cwd}}) => {
  const stream = transform.file((file) => {
    // const cwd = process.cwd()
    const filecontents = file.contents
    const filepath = file.path

    if (!isJavaScriptFile(filepath) || !isInAppFolder(filepath, cwd) || filecontents === null) {
      return file
    }

    const contents = filecontents.toString()

    const newContents = replaceRelativeImports(contents, relativeToAbsolute(cwd, filepath))
    file.contents = Buffer.from(newContents)

    return file
  })

  return {stream}
}

const isJavaScriptFile = (filepath: string) => filepath.match(/\.(ts|tsx|js|jsx)$/)

const isInAppFolder = (s: string, cwd: string) => s.replace(cwd + path.sep, "").indexOf("app") === 0

export const patternRelativeImportSingle = /(import(?:\s|\()(?:{[^}]*})?.*(?=(?:['"])(?:\.[^'"]+)(?:['"]))(?:['"]))(\.[^'"]+)(['"])/
export const patternRelativeImportGlobal = new RegExp(patternRelativeImportSingle, "g")

export function replaceRelativeImports(content: string, replacer: (s: string) => string) {
  return content.replace(patternRelativeImportGlobal, (...args) => {
    const [, start, importPath, end] = args
    return [start, replacer(importPath), end].join("")
  })
}

export function relativeToAbsolute(_cwd: string, _filename: string) {
  return (filePath: string) => {
    if (filePath.indexOf(".") !== 0) return filePath

    return slash(path.join(path.dirname(_filename), filePath).replace(_cwd + path.sep, ""))
  }
}
