import {parseSemver} from "./parse-semver"

describe("parseSemver", () => {
  describe("when given a non-semver-string", () => {
    it("throws", () => {
      expect(() => parseSemver("non-semver")).toThrow()
    })
  })

  describe("when given a valid semver string", () => {
    it("returns major, minor and patch", () => {
      expect(parseSemver("12.8.4")).toEqual({
        major: 12,
        minor: 8,
        patch: 4,
      })
    })
  })

  describe("when given a valid semver string preceded by a `v`", () => {
    it("returns major, minor and patch", () => {
      expect(parseSemver("v12.8.4")).toEqual({
        major: 12,
        minor: 8,
        patch: 4,
      })
    })
  })
})
