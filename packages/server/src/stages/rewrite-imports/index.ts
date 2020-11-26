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

export const patternImport = /(import.*?["'])(.+?)(["'])/gs

export function replaceImports(content: string) {
  return content.replace(patternImport, (...args) => {
    const [, start, resource, end] = args as string[]

    return start + rewriteImportOrigin(resource) + end
  })
}

export function rewriteImportOrigin(origin: string): string {
  const parts = origin.split("/")

  // If it's an import from a page, say from app/pages/mypage,
  // we'll rewrite that import to pages/mypage.
  if (parts.includes("pages")) {
    if (parts[0] === "app") {
      parts.splice(0, 1)
    }
  }

  // If it's an import from an API Route, say from app/users/api/myRoute,
  // we'll rewrite it to pages/api/myRoute.
  if (parts.includes("api")) {
    if (parts.indexOf("api") === parts.length - 1) {
      parts.push("index")
    }

    parts.splice(0, parts.indexOf("api"), "pages")
  }

  return parts.join("/")
}
