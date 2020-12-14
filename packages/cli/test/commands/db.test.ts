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
let migrateParams: any[]
let migrateWithNameParams: any[]
let migrateWithUnknownParams: any[]

beforeAll(async () => {
  schemaArg = `--schema=${path.join(process.cwd(), "db", "schema.prisma")}`
  prismaBin = await resolveBinAsync("@prisma/cli", "prisma")

  migrateParams = [
    prismaBin,
    ["migrate", "dev", schemaArg, "--preview-feature"],
    {stdio: "inherit", env: process.env},
  ]
  migrateWithNameParams = [
    prismaBin,
    ["migrate", "dev", schemaArg, "--preview-feature", "--name", "name"],
    {stdio: "ignore", env: process.env},
  ]
  migrateWithUnknownParams = [
    prismaBin,
    ["migrate", "dev", schemaArg, "--preview-feature"],
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
    expect(spawn).toBeCalledWith(...migrateParams)
    expect(spawn).toHaveBeenCalledTimes(1)

    expect(onSpy).toHaveBeenCalledTimes(1)
  }

  function expectProductionDbMigrateOutcome() {
    expect(spawn).toHaveBeenCalledTimes(1)

    expect(onSpy).toHaveBeenCalledTimes(1)
  }

  function expectDbMigrateWithNameOutcome() {
    expect(spawn).toBeCalledWith(...migrateWithNameParams)
    expect(spawn).toHaveBeenCalledTimes(1)

    expect(onSpy).toHaveBeenCalledTimes(1)
  }

  function expectDbMigrateWithUnknownFlag() {
    expect(spawn).toBeCalledWith(...migrateWithUnknownParams)
    expect(spawn).toHaveBeenCalledTimes(1)

    expect(onSpy).toHaveBeenCalledTimes(1)
  }

  function expectDbSeedOutcome() {
    expect(spawn).toBeCalledWith(...migrateParams)
    expect(spawn.mock.calls.length).toBe(1)
    expect(onSpy).toHaveBeenCalledTimes(1)
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
    await Db.run(["migrate", "--hoge", "aaa"])

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

    expect(spawn).toHaveBeenCalledWith(prismaBin, ["studio", schemaArg], {
      stdio: "inherit",
      env: process.env,
    })
  })

  it("does not run db in case of invalid command", async () => {
    await Db.run(["invalid"])

    expect(spawn.mock.calls.length).toBe(0)
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
