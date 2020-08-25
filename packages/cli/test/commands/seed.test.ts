import {join} from "path"
import pkgDir from "pkg-dir"
import {resolveBinAsync} from "@blitzjs/server"

let onSpy: jest.Mock
const spawn = jest.fn(() => {
  onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
    callback(0)
  })
  return {on: onSpy}
})

jest.doMock("cross-spawn", () => ({spawn}))

pkgDir.sync = jest.fn(() => join(__dirname, "../__fixtures__/"))

let seedsFn: jest.Mock
jest.doMock("../__fixtures__/db/seeds", () => {
  seedsFn = jest.fn()
  return {default: seedsFn}
})

let disconnect: jest.Mock
jest.doMock("../__fixtures__/db", () => {
  disconnect = jest.fn()
  return {default: {disconnect}}
})

import {Seed} from "../../src/commands/seed"

let schemaArg: string
let prismaBin: string
let migrateUpDevParams: any[]
let migrateSaveParams: any[]

beforeAll(async () => {
  schemaArg = `--schema=${join(process.cwd(), "db", "schema.prisma")}`
  prismaBin = await resolveBinAsync("@prisma/cli", "prisma")

  migrateSaveParams = [
    prismaBin,
    ["migrate", "save", schemaArg, "--create-db", "--experimental"],
    {stdio: "inherit"},
  ]
  migrateUpDevParams = [
    prismaBin,
    ["migrate", "up", schemaArg, "--create-db", "--experimental"],
    {stdio: "inherit"},
  ]

  jest.spyOn(global.console, "log").mockImplementation(jest.fn((output: string) => {}))
})

describe("Start command", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env.NODE_ENV = "test"
  })

  function expectDbMigrateOutcome() {
    expect(spawn).toBeCalledWith(...migrateSaveParams)
    expect(spawn.mock.calls.length).toBe(3)
    expect(spawn).toBeCalledWith(...migrateUpDevParams)
  }

  it("runs migrations and closes db at the end", async () => {
    await Seed.run()
    expectDbMigrateOutcome()
  })

  it("seeds the db", async () => {
    await Seed.run()
    expect(seedsFn).toBeCalled()
  })

  it("closes connection at the end", async () => {
    await Seed.run()
    expect(disconnect).toBeCalled()
  })
})
