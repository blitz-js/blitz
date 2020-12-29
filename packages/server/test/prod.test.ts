/* eslint-disable import/first */

import { resolve } from "path"
import { multiMock } from "./utils/multi-mock"

const mocks = multiMock(
  {
    build: { build: jest.fn().mockReturnValue(Promise.resolve()) },
    "next-utils": {
      nextStart: jest.fn().mockReturnValue(Promise.resolve()),
      nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
    },
    "resolve-bin-async": {
      resolveBinAsync: jest.fn().mockReturnValue(Promise.resolve("")),
    },
  },
  resolve(__dirname, "../src"),
)

jest.mock("@blitzjs/config", () => {
  return {
    getConfig: jest.fn().mockReturnValue({}),
  }
})

// Import with mocks applied
import { ensureDir } from "fs-extra"
import { prod } from "../src/prod"

describe("Prod command", () => {
  const rootFolder = resolve("build")
  const buildFolder = resolve(rootFolder, ".blitz-build")
  const devFolder = resolve(rootFolder, ".blitz")
  const prodArgs = {
    rootFolder,
    buildFolder,
    devFolder,
    writeManifestFile: false,
    port: 3000,
    hostname: "localhost",
  }

  beforeEach(() => {
    mocks.mockFs({
      build: {
        ".now": "",
        one: "",
        two: "",
      },
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    mocks.mockFs.restore()
  })

  describe("When already built", () => {
    it("should not trigger build step", async () => {
      await ensureDir(buildFolder)
      await prod(prodArgs)
      expect(mocks.build.build.mock.calls).toEqual([])
    })
  })
})
