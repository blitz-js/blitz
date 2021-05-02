import {Stage, transform} from "@blitzjs/file-pipeline"
import path from "path"
import slash from "slash"

const isJavaScriptFile = (filepath: string) => filepath.match(/\.(ts|tsx|js|jsx)$/)

const isInSpecialFolderInAppFolder = (s: string, cwd: string) => {
  const filepath = s.replace(cwd + path.sep, "")
  return /^app[/\\].*(pages|api|queries|mutations)[/\\]/.test(filepath)
}

/**
 * Returns a Stage that converts relative files paths to absolute
 */
export const createStageRelative: Stage = ({config: {cwd}}) => {
  const stream = transform.file((file) => {
    // const cwd = process.cwd()
    const filecontents = file.contents
    const filepath = file.path

    if (
      !isJavaScriptFile(filepath) ||
      !isInSpecialFolderInAppFolder(filepath, cwd) ||
      filecontents === null
    ) {
      return file
    }

    const contents = filecontents.toString()

    const newContents = replaceRelativeImports(contents, relativeToAbsolute(cwd, filepath))
    file.contents = Buffer.from(newContents)

    return file
  })

  return {stream}
}

export const patternRelativeImportSingle = /(import(?:\s|\()(?:{[^}]*})?.*(?=(?:['"])(?:\.[^'"]+)(?:['"]))(?:['"]))(\.[^'"]+)(['"])/
export const patternRelativeImportGlobal = new RegExp(patternRelativeImportSingle, "g")

export function replaceRelativeImports(content: string, replacer: (s: string) => string) {
  return content.replace(patternRelativeImportGlobal, (...args) => {
    const [, start, importPath, end] = args
    return [start, replacer(importPath), end].join("")
  })
}

function isAbsolute(path: string) {
  if (path.indexOf("./") === 0) {
    return false
  }

  if (path.indexOf("../") === 0) {
    return false
  }

  return true
}

export function relativeToAbsolute(_cwd: string, _filename: string) {
  return (filePath: string) => {
    if (isAbsolute(filePath)) return filePath

    return slash(path.join(path.dirname(_filename), filePath).replace(_cwd + path.sep, ""))
  }
}
