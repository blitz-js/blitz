import {Stage, transform} from "@blitzjs/file-pipeline"
import path from "path"
// import slash from "slash"

const isJavaScriptFile = (filepath: string) => filepath.match(/\.(ts|tsx|js|jsx)$/)

const isInAppFolder = (s: string, cwd: string) => s.replace(cwd + path.sep, "").indexOf("app") === 0

/**
 * Returns a Stage that converts relative files paths to absolute
 */
export const createStageRewriteImports: Stage = ({config: {cwd}}) => {
  const stream = transform.file((file) => {
    const filecontents = file.contents
    const filepath = file.path

    if (!isJavaScriptFile(filepath) || !isInAppFolder(filepath, cwd) || filecontents === null) {
      return file
    }

    const contents = filecontents.toString()

    const newContents = replaceImports(contents, rewriteImports(cwd, filepath))
    file.contents = Buffer.from(newContents)

    return file
  })

  return {stream}
}

export const patternImport = /(import(?:\s|\()(?:{[^}]*})?(?:\sfrom\s+)?(?=(?:['"])(?:[^'"]+)(?:['"]))(?:['"]))([^'"]+)(['"])/g

export function replaceImports(content: string, replacer: (s: string) => string) {
  return content.replace(patternImport, (...args) => {
    const [, start, importPath, end] = args as string[]

    return [start, replacer(importPath), end].join("")
  })
}

export function rewriteImports(_cwd: string, _filename: string) {
  return (importPath: string) => {
    let parts = importPath.split("/")

    if (parts.includes("pages")) {
      if (parts[0] === "app") {
        parts = parts.slice(1)
      }
    }

    if (parts.includes("queries")) {
      return importPath
    }

    if (parts.includes("mutations")) {
      return importPath
    }

    return parts.join("/")
  }
}
