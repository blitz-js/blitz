import {
  chokidarRulesFromGitignore,
  isControlledByUser,
} from "../src/parse-chokidar-rules-from-gitignore"

describe("isControlledByUser", () => {
  describe("given a .gitignore from a dependency", () => {
    it("returns false", () => {
      expect(isControlledByUser("node_modules/npm-normalize-package-bin/.gitignore")).toBe(false)
    })
  })

  describe("given a nested, but user-controlled file", () => {
    it("returns true", () => {
      expect(isControlledByUser("app/myassets/.gitignore")).toBe(true)
    })
  })
})

describe("chokidarRulesFromGitignore", () => {
  describe("when passed a simple, prefixed .gitignore file", () => {
    it("returns the prefixed chokidar rules", () => {
      expect(
        chokidarRulesFromGitignore({
          prefix: "src/app/db/",
          gitIgnore: `
.db_log
!migrations
        `,
        }),
      ).toEqual({
        ignoredPaths: ["src/app/db/.db_log"],
        includePaths: ["src/app/db/migrations"],
      })
    })
  })
})
