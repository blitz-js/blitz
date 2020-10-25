import spawn from "cross-spawn"
import {resolve} from "path"
import {
  chokidarRulesFromGitignore,
  getAllGitIgnores,
  isControlledByUser,
} from "../src/parse-chokidar-rules-from-gitignore"
import {multiMock} from "./utils/multi-mock"
const mocks = multiMock({}, resolve(__dirname, ".."))
const originalSync = spawn.sync

const globalIgnore = `
/user/lib/something
.history/**
`

const localIgnoreValue = `
.foo
.bar
`
const nestedIgnoreValue = `
.bip
.bop
`

beforeEach(() => {
  // @ts-ignore (TS complains about reassign)
  spawn.sync = jest.fn().mockImplementation((command, options) => {
    if (command === "git" && options[0] === "config") {
      return {status: 0, stdout: "/global/.gitignore"}
    }
  })
})

afterEach(() => {
  // @ts-ignore (TS complains about reassign)
  spawn.sync = originalSync
})

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
  afterEach(() => {
    jest.clearAllMocks()
    mocks.mockFs.restore()
  })

  describe("given a global .gitignore file", () => {
    beforeEach(() => {
      mocks.mockFs({
        "/global": {
          ".gitignore": globalIgnore,
        },
      })
    })
    it("returns the file", () => {
      expect(getAllGitIgnores(resolve(__dirname, ".."))).toEqual([
        {
          prefix: "",
          gitIgnore: globalIgnore,
        },
      ])
    })
  })

  describe("given a .git/info/exclude file at the root", () => {
    beforeAll(() => {
      mocks.mockFs({
        ".git": {
          info: {
            exclude: localIgnoreValue,
          },
        },
      })
    })
    it("returns the file", () => {
      expect(getAllGitIgnores(resolve(__dirname, ".."))).toEqual([
        {
          prefix: "",
          gitIgnore: localIgnoreValue,
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
