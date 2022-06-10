import {describe, expect, it} from "vitest"
import {convertPageFilePathToRoutePath} from "./loader-utils"

const FILE_PATH = "app/queries/getData.ts"

describe("convertPageFilePathToRoutePath", () => {
  it("should return the full path when resolverBasePath is set to root", () => {
    const res = convertPageFilePathToRoutePath(FILE_PATH, "root")

    expect(res).toEqual("app/queries/getData")
  })

  it("should return the relative path when resolverBasePath is set to queries|mutations", () => {
    const res = convertPageFilePathToRoutePath(FILE_PATH, "queries|mutations")

    expect(res).toEqual("/getData")
  })

  it("should return the relative path when resolverBasePath is set to undefined", () => {
    const res = convertPageFilePathToRoutePath(FILE_PATH, undefined)

    expect(res).toEqual("/getData")
  })
})
