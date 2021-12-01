import spawn from "cross-spawn"
import {baseLogger} from "next/dist/server/lib/logging"
import {AppGenerator} from "../../src/generators/app-generator"

// Spies process to avoid trying to chdir to a non existing folder
jest.spyOn(process, "chdir").mockImplementation(() => true)
jest.spyOn(global.console, "log").mockImplementation()
// Mocks the log output
jest.mock(
  "next/dist/server/lib/logging",
  jest.fn(() => {
    const warn = jest.fn()
    return {
      log: {
        success: jest.fn(),
        progress: jest.fn(),
        error: jest.fn(),
        withBrand: jest.fn(),
        spinner: jest.fn().mockImplementation(() => {
          return {
            start: jest.fn().mockImplementation(() => ({succeed: jest.fn()})),
          }
        }),
      },
      baseLogger: jest.fn().mockImplementation((config: any) => {
        return {
          warn
        }
      }),
    }
  }),
)

// Mocks spawn
jest.mock("cross-spawn", () => {
  const spawn = jest.fn().mockImplementation(() => {
    return {
      stdout: {
        setEncoding: jest.fn(),
        on: jest.fn(),
      },
      on: (_: any, callback: any) => callback(),
    }
  })
  // @ts-ignore (TS complains about reassign)
  spawn.sync = jest.fn().mockImplementation(() => {
    return {status: 0}
  })
  return spawn
})

// Mocks fs-extra used by both AppGenerator and Generator base class
jest.mock(
  "fs-extra",
  jest.fn(() => {
    return {
      readJSONSync: jest.fn().mockImplementation(() => ({
        dependencies: {
          react: "^16.8.0",
        },
        devDependencies: {
          debug: "^4.1.1",
        },
      })),
      ensureDir: jest.fn(),
      existsSync: jest.fn(),
      writeJson: jest.fn(),
    }
  }),
)

jest.mock(
  "mem-fs-editor",
  jest.fn(() => {
    return {
      create: jest.fn().mockImplementation(() => {
        return {
          move: jest.fn(),
          readJSON: jest.fn().mockImplementation(() => ({
            dependencies: {},
            devDependencies: {},
          })),
          writeJSON: jest.fn(),
          commit: (_: any, callback: any) => callback(),
          copy: jest.fn(),
          delete: jest.fn(),
        }
      }),
    }
  }),
)

describe("AppGenerator", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const generator = new AppGenerator({
    template: {
      path: "app",
    },
    appName: "new-app",
    dryRun: false,
    useTs: true,
    yarn: true,
    version: "1.0",
    skipInstall: false,
    form: "React Final Form",
    skipGit: false,
  })

  it("calls git init", async () => {
    await generator.run()

    expect(spawn.sync).toHaveBeenCalledWith("git", ["init"], {stdio: "ignore"})
  })

  it("calls git add", async () => {
    await generator.run()

    expect(spawn.sync).toHaveBeenCalledWith("git", ["add", "."], {stdio: "ignore"})
  })

  it("calls git commit", async () => {
    await generator.run()

    //
    expect(spawn.sync).toHaveBeenCalledWith(
      "git",
      [
        "-c",
        "user.name='Blitz.js CLI'",
        "-c",
        "user.email='noop@blitzjs.com'",
        "commit",
        "--no-gpg-sign",
        "--no-verify",
        "-m",
        "Brand new Blitz app!",
      ],
      {
        stdio: "ignore",
        timeout: 10000,
      },
    )
  })

  describe("when git init fails", () => {
    it.only("logs warn with instructions", async () => {
      // @ts-ignore (TS complains about reassign)
      spawn.sync = jest.fn().mockImplementation((command, options) => {
        if (command === "git" && options[0] === "init") {
          return {status: 1}
        }
        return {status: 0}
      })
      await generator.run()

      expect(baseLogger().warn).toHaveBeenCalledWith(
        "Failed to run git init.",
      )
      expect(baseLogger().warn).toHaveBeenCalledWith(
        "Find out more about how to install git here: https://git-scm.com/downloads.",
      )
    })
  })
})
