import {Stage, transform} from "@blitzjs/file-pipeline"
import flow from "lodash/flow"
import {join} from "path"
import {absolutePathTransform} from "../utils"
import {DuplicatePathError, handleErrors} from "./errors"

export function pagesPathTransformer(path: string) {
  const regex = /(?:[\\/]?app[\\/].*?[\\/]?)(pages[\\/].+(?<!\.test)\.(m?[tj]sx?|mdx))$/
  return (regex.exec(path) || [])[1] || path
}

export function apiPathTransformer(path: string) {
  const regex = /(?:[\\/]?app[\\/].*?[\\/]?)(api[\\/].+)$/
  const matchedPath = (regex.exec(path) || [])[1]
  return matchedPath ? join("pages", matchedPath) : path
}

export const fullTransformer = flow(pagesPathTransformer, apiPathTransformer)

// Derived from
// https://codereview.stackexchange.com/questions/203102/count-duplicates-in-a-javascript-array
export function findDuplicates(original: string[], transformer: (a: string) => string = (a) => a) {
  const uniqueItems = new Set<string>()
  const duplicates = new Set<string>()
  const inputMap = new Map<string, Set<string>>()
  const duplicateInput = new Set<Set<string>>()

  for (const value of original) {
    const transformed = transformer(value)

    if (!inputMap.has(transformed)) {
      inputMap.set(transformed, new Set<string>())
    }

    const transformedLookup = inputMap.get(transformed)!
    transformedLookup.add(value)

    if (uniqueItems.has(transformed)) {
      duplicates.add(transformed)
      duplicateInput.add(transformedLookup)
      uniqueItems.delete(transformed)
    } else {
      uniqueItems.add(transformed)
    }
  }
  return toArray(duplicateInput)
}
function toArray(nestedSet: Set<Set<string>>) {
  return Array.from(nestedSet).map((set) => Array.from(set))
}

// Retain rows where some items have yes and no items contain no
export function filterBy(entries: string[][], yes: string, no?: string) {
  return entries.filter((row) => {
    let rowContainsYes = false
    let rowContainsNo = false
    for (let item of row) {
      rowContainsYes = rowContainsYes || item.indexOf(yes) > -1
      if (typeof no === "string") {
        rowContainsNo = rowContainsNo || item.indexOf(no) > -1
      }
    }
    return rowContainsYes && !rowContainsNo
  })
}

/**
 * Returns a Stage to assemble NextJS `/pages` folder from within
 * the BlitzJS folder structure
 */
export const createStagePages: Stage = ({config, bus, getInputCache}) => {
  const {src} = config

  handleErrors(bus)

  const pagesTransformer = absolutePathTransform(src)(pagesPathTransformer)
  const apiTransformer = absolutePathTransform(src)(apiPathTransformer)

  const stream: NodeJS.ReadWriteStream = transform.file((file) => {
    const entries = getInputCache().toPaths()

    const duplicates = findDuplicates(entries, fullTransformer)

    // Check for duplicate pages entries
    const duplicatePages = filterBy(duplicates, "pages", "api")

    if (duplicatePages.length > 0) {
      return new DuplicatePathError(
        "Warning: You have created conflicting page routes:",
        "pages",
        duplicatePages,
      )
    }

    // Check for duplicate api entries
    const duplicateApi = filterBy(duplicates, "api")
    if (duplicateApi.length > 0) {
      return new DuplicatePathError(
        "Warning: You have created conflicting api routes:",
        "api",
        duplicateApi,
      )
    }

    file.originalPath = file.path
    file.originalRelative = file.relative
    file.path = apiTransformer(pagesTransformer(file.path))

    return file
  })

  return {stream}
}
