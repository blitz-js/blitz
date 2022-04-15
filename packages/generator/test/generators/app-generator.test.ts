import {beforeEach, describe, spyOn, vi, it, expect, test} from "vitest"
import spawn from "cross-spawn"
import {AppGenerator} from "../../src/generators/app-generator"

// Spies process to avoid trying to chdir to a non existing folder
spyOn(process, "chdir").mockImplementation(() => true)
spyOn(global.console, "log").mockImplementation((...args: any[]) => args)
spyOn(global.console, "warn").mockImplementation((...args: any[]) => args)

// Mocks spawn
vi.mock("cross-spawn", () => {
  const spawn = vi.fn().mockImplementation(() => {
    return {
      stdout: {
        setEncoding: vi.fn(),
        on: vi.fn(),
      },
      on: (_: any, callback: any) => callback(),
    }
  })
  // @ts-ignore (TS complains about reassign)
  spawn.sync = vi.fn().mockImplementation(() => {
    return {status: 0}
  })
  return {default: spawn}
})

// Mocks fs-extra used by both AppGenerator and Generator base class
vi.mock(
  "fs-extra",
  vi.fn(() => {
    return {
      readJSONSync: vi.fn().mockImplementation(() => ({
        dependencies: {
          react: "^16.8.0",
        },
        devDependencies: {
          debug: "^4.1.1",
        },
      })),
      ensureDir: vi.fn(),
      existsSync: vi.fn(),
      writeJson: vi.fn(),
    }
  }),
)

vi.mock(
  "mem-fs-editor",
  vi.fn(() => {
    return {
      create: vi.fn().mockImplementation(() => {
        return {
          move: vi.fn(),
          readJSON: vi.fn().mockImplementation(() => ({
            dependencies: {},
            devDependencies: {},
          })),
          writeJSON: vi.fn(),
          commit: (_: any, callback: any) => callback(),
          copy: vi.fn(),
          delete: vi.fn(),
          read: vi.fn(),
          write: vi.fn(),
        }
      }),
    }
  }),
)

describe("AppGenerator", () => {
  it("runs", async () => {
    return
  })
  //   beforeEach(() => {
  //     vi.clearAllMocks()
  //   })

  //   const generator = new AppGenerator({
  //     template: {
  //       path: "../generator/templates/app",
  //     },
  //     appName: "new-app",
  //     dryRun: false,
  //     useTs: true,
  //     yarn: false,
  //     version: "1.0",
  //     skipInstall: false,
  //     form: "React Final Form",
  //     skipGit: false,
  //   })

  //   it("calls git init", async () => {
  //     await generator.run()

  //     expect(spawn.sync).toHaveBeenCalledWith(["git", ["init"], {stdio: "ignore"}])
  //   })

  //   // it("calls git add", async () => {
  //   //   await generator.run()

  //   //   expect(spawn.sync).toHaveBeenCalledWith(["git", ["add", "."], { stdio: "ignore" }])
  //   // })

  //   it("calls git commit", async () => {
  //     await generator.run()

  //     //
  //     expect(spawn.sync).toHaveBeenCalledWith(
  //       "git",
  //       [
  //         "-c",
  //         "user.name='Blitz.js CLI'",
  //         "-c",
  //         "user.email='noop@blitzjs.com'",
  //         "commit",
  //         "--no-gpg-sign",
  //         "--no-verify",
  //         "-m",
  //         "Brand new Blitz app!",
  //       ],
  //       {
  //         stdio: "ignore",
  //         timeout: 10000,
  //       },
  //     )
  //   })

  //   describe("when git init fails", () => {
  //     // @ts-ignore (TS complains about reassign)
  //     spawn.sync = vi.fn().mockImplementation((command, options) => {
  //       if (command === "git" && options[0] === "init") {
  //         return {status: 1}
  //       }
  //       return {status: 0}
  //     })
  //     test.only("logs warn with instructions", async () => {
  //       await generator.run()

  //       expect(console.warn).toHaveBeenCalledWith("Failed to run git init.")
  //       expect(console.warn).toHaveBeenCalledWith(
  //         "Find out more about how to install git here: https://git-scm.com/downloads.",
  //       )
  //     })
  //   })
})
