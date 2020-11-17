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

    const newContents = replaceImports(contents)
    file.contents = Buffer.from(newContents)

    return file
  })

  return {stream}
}

export const patternImport = /(import\s*)(?:(\*\s+as\s+\w+)|(?:(\w+\s*)(,\s*)?)?(?:(\{\s*\w+\s*(?:,\s*\w+\s*)*\}))?)(\s+from\s+)?((?:\(\s*)?["'])([\w\.\\\/]+)(["'](?:\s*\))?)/gs

export function replaceImports(content: string) {
  return content.replace(patternImport, (...args) => {
    const [
      ,
      importToken,
      starImport,
      defaultImportName,
      combinedComma,
      namedImportNames,
      fromToken,
      openingQuotes,
      origin,
      closingQuotes,
    ] = args as (string | undefined)[]

    const importsOnlyDefault = !!defaultImportName && !(starImport || namedImportNames)

    const newOrigin = rewriteImportOrigin(origin!, !importsOnlyDefault)

    return [
      importToken,
      starImport ?? "",
      defaultImportName ?? "",
      combinedComma ?? "",
      namedImportNames ?? "",
      fromToken ?? "",
      openingQuotes,
      newOrigin,
      closingQuotes,
    ].join("")
  })
}

export function rewriteImportOrigin(origin: string, importsNamedExports: boolean): string {
  const parts = origin.split("/")

  if (parts.includes("pages")) {
    if (parts[0] === "app") {
      parts.splice(0, 1)
    }
  }

  if (parts.includes("api")) {
    if (parts.indexOf("api") === parts.length - 1) {
      parts.push("index")
    }

    parts.splice(0, parts.indexOf("api"), "pages")
  }

  if (importsNamedExports) {
    const indexOfQueries = parts.lastIndexOf("queries")
    const indexOfMutations = parts.lastIndexOf("mutations")

    if (indexOfQueries !== -1 || indexOfMutations !== -1) {
      if (indexOfQueries === parts.length - 1 || indexOfMutations === parts.length - 1) {
        parts.push("index")
      }

      parts[parts.length - 1] = parts[parts.length - 1] + ".named"
    }
  }

  return parts.join("/")
}
