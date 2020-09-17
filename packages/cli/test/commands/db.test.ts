import * as path from "path"
import {resolveBinAsync} from "@blitzjs/server"

let onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
  callback(0)
})

const spawn = jest.fn(() => ({on: onSpy, off: jest.fn()}))

jest.doMock("cross-spawn", () => ({spawn}))

import {Db} from "../../src/commands/db"

let schemaArg: string
let prismaBin: string
let migrateSaveParams: any[]
let migrateUpDevParams: any[]
let migrateUpProdParams: any[]
let migrateSaveWithNameParams: any[]
let migrateSaveWithUnknownParams: any[]
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
  migrateUpProdParams = [
    prismaBin,
    ["migrate", "up", schemaArg, "--create-db", "--experimental", "--auto-approve"],
    {stdio: "inherit", env: process.env},
  ]
  migrateSaveWithNameParams = [
    prismaBin,
    ["migrate", "save", schemaArg, "--create-db", "--experimental", "--name", "name"],
    {stdio: "ignore", env: process.env},
  ]
  migrateSaveWithUnknownParams = [
    prismaBin,
    ["migrate", "save", schemaArg, "--create-db", "--experimental"],
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

  function expectDbMigrateOutcome() {
    expect(spawn).toBeCalledWith(...migrateSaveParams)
    expect(spawn).toHaveBeenCalledTimes(3)

    expect(onSpy).toHaveBeenCalledTimes(3)

    expect(spawn).toBeCalledWith(...migrateUpDevParams)
  }

  function expectProductionDbMigrateOutcome() {
    expect(spawn).toHaveBeenCalledTimes(2)

    expect(onSpy).toHaveBeenCalledTimes(2)

    expect(spawn).toBeCalledWith(...migrateUpProdParams)
  }

  function expectDbMigrateWithNameOutcome() {
    expect(spawn).toBeCalledWith(...migrateSaveWithNameParams)
    expect(spawn).toHaveBeenCalledTimes(3)

    expect(onSpy).toHaveBeenCalledTimes(3)
  }

  function expectDbMigrateWithUnknownFlag() {
    expect(spawn).toBeCalledWith(...migrateSaveWithUnknownParams)
    expect(spawn).toHaveBeenCalledTimes(3)

    expect(onSpy).toHaveBeenCalledTimes(3)
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

  it("runs db migrate", async () => {
    await Db.run(["migrate"])
    expectDbMigrateOutcome()
  })

  it("runs db migrate in the production environment.", async () => {
    process.env.NODE_ENV = "production"
    await Db.run(["migrate"])
    expectProductionDbMigrateOutcome()
  })

  it("runs db migrate (alias)", async () => {
    await Db.run(["m"])
    expectDbMigrateOutcome()
  })

  it("runs db migrate (alias) in the production environment.", async () => {
    process.env.NODE_ENV = "production"
    await Db.run(["m"])
    expectProductionDbMigrateOutcome()
  })

  it("runs db migrate silently with the right args when name flag is used", async () => {
    await Db.run(["migrate", "--name", "name"])

    expectDbMigrateWithNameOutcome()
  })

  it("runs db migrate. (with unknown flags)", async () => {
    await Db.run(["migrate", "--hoge", 'aaa'])

    expectDbMigrateWithUnknownFlag()
  })

  it("runs db introspect", async () => {
    await Db.run(["introspect"])

    expect(spawn).toHaveBeenCalledWith(prismaBin, ["introspect", schemaArg], {
      stdio: "inherit",
      env: process.env,
    })
    expect(spawn).toHaveBeenCalledWith(prismaBin, ["generate", schemaArg], {
      stdio: "inherit",
      env: process.env,
    })
  })

  it("runs db studio", async () => {
    await Db.run(["studio"])

    expect(spawn).toHaveBeenCalledWith(prismaBin, ["studio", schemaArg, "--experimental"], {
      stdio: "inherit",
      env: process.env,
    })
  })

  it("does not run db in case of invalid command", async () => {
    await Db.run(["invalid"])

    expect(spawn.mock.calls.length).toBe(0)
  })
})
