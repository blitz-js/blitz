import * as path from "path"
import {resolveBinAsync} from "@blitzjs/server"
import pkgDir from "pkg-dir"
import {join} from "path"
import {Db} from "../../src/commands/db"

let onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
  callback(0)
})
const spawn = jest.fn(() => ({on: onSpy, off: jest.fn()}))

jest.doMock("cross-spawn", () => ({spawn}))

pkgDir.sync = jest.fn(() => join(__dirname, "../__fixtures__/"))

let schemaArg: string
let prismaBin: string
let migrateSaveParams: any[]
let migrateUpDevParams: any[]

beforeAll(async () => {
  schemaArg = `--schema=${path.join(process.cwd(), "db", "schema.prisma")}`
  prismaBin = await resolveBinAsync("@prisma/cli", "prisma")

  migrateSaveParams = [
    prismaBin,
    ["migrate", "save", schemaArg, "--create-db", "--experimental"],
    {stdio: "inherit", env: process.env},
  ]
  migrateUpDevParams = [
    prismaBin,
    ["migrate", "up", schemaArg, "--create-db", "--experimental"],
    {stdio: "inherit", env: process.env},
  ]
})

describe("Db command", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env.NODE_ENV = "test"
  })

  function expectDbSeedOutcome() {
    expect(spawn).toBeCalledWith(...migrateSaveParams)
    expect(spawn.mock.calls.length).toBe(3)
    expect(onSpy).toHaveBeenCalledTimes(3)
    expect(spawn).toBeCalledWith(...migrateUpDevParams)
  }

  it("runs db help when no command given", async () => {
    // When running the help command oclif exits with code 0
    // Unfortantely it treats this as an exception and throws accordingly

    // Get the db --help command output
    let dbHelpCommandOutput = []
    let dbHelpCommandExit
    try {
      jest.spyOn(global.console, "log").mockImplementation(
        jest.fn((output: string) => {
          dbHelpCommandOutput.push(output)
        }),
      )

      await Db.run(["--help"])
    } catch (e) {
      dbHelpCommandExit = e
    }

    // Get the db command output
    let dbCommandOutput = []
    let dbCommandExit
    try {
      jest.spyOn(global.console, "log").mockImplementation(
        jest.fn((output: string) => {
          dbCommandOutput.push(output)
        }),
      )

      await Db.run([])
    } catch (e) {
      dbCommandExit = e
    }

    // We expect the 2 outputs to be the same
    expect(dbHelpCommandOutput).toEqual(dbCommandOutput)
    expect(dbHelpCommandExit).toEqual(dbCommandExit)
  })

  describe("runs db seed", () => {
    let $disconnect: jest.Mock
    beforeAll(() => {
      jest.doMock("../__fixtures__/db", () => {
        $disconnect = jest.fn()
        return {default: {$disconnect}}
      })
    })

    it("runs migrations and closes db at the end", async () => {
      await Db.run(["seed"])
      expectDbSeedOutcome()
    })

    it("closes connection at the end", async () => {
      await Db.run(["seed"])
      expect($disconnect).toBeCalled()
    })
  })
})
