import {Stage, transform} from "@blitzjs/file-pipeline"
import path from "path"

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

    const newContents = replaceImports(contents, rewriteImports)
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

export function rewriteImports(importPath: string) {
  const parts = importPath.split("/")

  if (parts.includes("pages")) {
    if (parts[0] === "app") {
      parts.splice(0, 1)
    }
  }

  if (parts.includes("api")) {
    parts.splice(0, parts.indexOf("api"), "pages")
  }

  return parts.join("/")
}
