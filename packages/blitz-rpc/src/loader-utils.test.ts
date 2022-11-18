import {describe, expect, it} from "vitest"
import {convertPageFilePathToRoutePath} from "./loader-utils"

const APP_ROOT = "/Users/blitz/project"
const FILE_PATH = "/Users/blitz/project/app/queries/getData.ts"

const WIN_APP_ROOT = `D:a\\blitz\\project`
const WIN_FILE_PATH = `D:a\\blitz\\project\\app\\queries\\getData.ts`

describe("convertPageFilePathToRoutePath", () => {
  it("should return the full path when resolverBasePath is set to root", () => {
    const res = convertPageFilePathToRoutePath({
      absoluteFilePath: FILE_PATH,
      resolverBasePath: "root",
      appRoot: APP_ROOT,
    })

    expect(res).toEqual("/app/queries/getData")
  })

  it("should return the relative path when resolverBasePath is set to queries|mutations", () => {
    const res = convertPageFilePathToRoutePath({
      absoluteFilePath: FILE_PATH,
      resolverBasePath: "queries|mutations",
      appRoot: APP_ROOT,
    })

    expect(res).toEqual("/getData")
  })

  it("should return the relative path when resolverBasePath is set to undefined", () => {
    const res = convertPageFilePathToRoutePath({
      absoluteFilePath: FILE_PATH,
      resolverBasePath: undefined,
      appRoot: APP_ROOT,
    })

    expect(res).toEqual("/getData")
  })

  describe("windwos", () => {
    it("should return the full path when resolverBasePath is set to root", () => {
      const res = convertPageFilePathToRoutePath({
        absoluteFilePath: WIN_FILE_PATH,
        resolverBasePath: "root",
        appRoot: WIN_APP_ROOT,
      })

      expect(res).toEqual("/app/queries/getData")
    })
  })
})
