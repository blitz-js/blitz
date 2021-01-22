import {Stage, transform} from "@blitzjs/file-pipeline"
import fastGlob from "fast-glob"
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

    const newContents = replaceImports(contents, cwd)
    file.contents = Buffer.from(newContents)

    return file
  })

  return {stream}
}

export const patternImport = /(import.*?["'])(.+?)(["'])/gs

export function replaceImports(content: string, cwd: string) {
  return content.replace(patternImport, (...args) => {
    const [original, start, resource, end] = args as string[]

    if (resource.startsWith("@")) {
      return original
    }

    return start + rewriteImportOrigin(resource, cwd) + end
  })
}

/**
 * Check wether `someDir/api` links to `someDir/api.js` or `someDir/api/index.js`.
 */
function getImportType(absoluteOrigin: string, cwd: string) {
  const foundFiles = fastGlob.sync(
    // if absoluteOrigin is a file import,
    // we'll find a matching file.
    //
    [absoluteOrigin + ".[jt]s", absoluteOrigin + ".[jt]sx"],
    {
      cwd,
    },
  )

  return foundFiles.length > 0 ? "file" : "directory"
}

export function rewriteImportOrigin(origin: string, cwd: string): string {
  const parts = origin.split("/")

  if (parts.indexOf("pages") === parts.length - 1 || parts.indexOf("api") === parts.length - 1) {
    if (getImportType(origin, cwd) === "file") {
      return origin
    }
  }

  // If it's an import from a page, say from app/pages/mypage,
  // we'll rewrite that import to pages/mypage.
  if (parts.includes("pages")) {
    parts.splice(0, parts.indexOf("pages"))
  }

  // If it's an import from an API Route, say from app/users/api/myRoute,
  // we'll rewrite it to pages/api/myRoute.
  if (parts.includes("api")) {
    parts.splice(0, parts.indexOf("api"), "pages")
  }

  return parts.join("/")
}
