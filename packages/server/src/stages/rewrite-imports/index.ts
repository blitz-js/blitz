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

export const patternImport = /(import\s+)(?:(?:(\*\s+as\s+\w+)|(\w+\s*)?(,\s*)?(?:(\{\s*\w+\s*(?:,\s*\w+\s*)*\}))?))(\s+from\s+["'])?([\w\.\\\/]+)(["']\)?)/gs

export function replaceImports(content: string) {
  return content.replace(patternImport, (...args) => {
    const [
      ,
      ,
      starImport,
      defaultImportName,
      combinedComma,
      namedImportNames,
      ,
      origin,
      ,
    ] = args as string[]

    const parts = origin.split("/")

    if (parts.includes("pages")) {
      if (parts[0] === "app") {
        parts.splice(0, 1)
      }
    }

    if (parts.includes("api")) {
      parts.splice(0, parts.indexOf("api"), "pages")
    }

    if (starImport) {
      // I don't know yet what to do
      return args[0]
    }

    if (parts.includes("queries") || parts.includes("mutations")) {
      const adaptedImportPath = [...parts]
      adaptedImportPath.splice(1, 0, "_resolvers")
      const adpatedOrigin = adaptedImportPath.join("/")

      if (combinedComma) {
        return [
          `import ${defaultImportName} from "${origin}"`,
          `import ${namedImportNames} from "${adpatedOrigin}"`,
        ].join("\n")
      }

      if (namedImportNames) {
        return `import ${namedImportNames} from "${adpatedOrigin}"`
      }
    }

    return `import ${defaultImportName ?? ""}${combinedComma ?? ""}${
      namedImportNames ?? ""
    } from "${parts.join("/")}"`
  })
}
