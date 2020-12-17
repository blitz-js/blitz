import pkgDir from "pkg-dir"
import {join} from "path"
import {Seed} from "../../src/commands/seed"

let onSpy = jest.fn(function on(_: string, callback: (_: number) => {}) {
  callback(0)
})
const spawn = jest.fn(() => ({on: onSpy, off: jest.fn()}))

jest.doMock("cross-spawn", () => ({spawn}))

pkgDir.sync = jest.fn(() => join(__dirname, "../__fixtures__/"))

describe("Seed command", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env.NODE_ENV = "test"
  })

  describe("runs seed", () => {
    let $disconnect: jest.Mock
    beforeAll(() => {
      jest.doMock("../__fixtures__/db", () => {
        $disconnect = jest.fn()
        return {default: {$disconnect}}
      })
    })

    it("closes connection at the end", async () => {
      await Seed.run(["seed"])
      expect($disconnect).toBeCalled()
    })
  })
})
