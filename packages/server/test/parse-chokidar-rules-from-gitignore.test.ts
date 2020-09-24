import {
  chokidarRulesFromGitignore,
  isControlledByUser,
  getAllGitIgnores,
} from "../src/parse-chokidar-rules-from-gitignore"
import {multiMock} from "./utils/multi-mock"
import {resolve} from "path"

const mocks = multiMock({}, resolve(__dirname, ".."))

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

describe("getAllGitIgnores", () => {
  const ignoreValue = `
	.foo
	.bar
				`
  const nestedIgnoreValue = `
				.bip
				.bop
							`

  afterEach(() => {
    jest.clearAllMocks()
    mocks.mockFs.restore()
  })

  describe("given a .git/info/exclude file at the root", () => {
    beforeAll(() => {
      mocks.mockFs({
        ".git": {
          info: {
            exclude: ignoreValue,
          },
        },
      })
    })
    it("returns the file", () => {
      expect(getAllGitIgnores(resolve(__dirname, ".."))).toEqual([
        {
          prefix: "",
          gitIgnore: ignoreValue,
        },
      ])
    })
  })

  describe("given a .git/info/exclude file in some nested submodule", () => {
    beforeAll(() => {
      mocks.mockFs({
        some: {
          nested: {
            submodule: {
              ".git": {
                info: {
                  exclude: nestedIgnoreValue,
                },
              },
            },
          },
        },
      })
    })
    it("returns the file", () => {
      expect(getAllGitIgnores(resolve(__dirname, ".."))).toEqual([
        {
          prefix: "some/nested/submodule/",
          gitIgnore: nestedIgnoreValue,
        },
      ])
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
