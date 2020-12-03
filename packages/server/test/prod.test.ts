/* eslint-disable import/first */

import {resolve} from "path"
import {multiMock} from "./utils/multi-mock"

const mocks = multiMock(
  {
    build: {build: jest.fn().mockReturnValue(Promise.resolve())},
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
import {ensureDir, writeFile} from "fs-extra"
import {getInputArtefactsHash} from "../src/build-hash"
import {prod} from "../src/prod"

describe("Prod command", () => {
  console.log("Starting prod test...")
  const rootFolder = resolve("build")
  console.log("rootFolder", rootFolder)
  const buildFolder = resolve(rootFolder, ".blitz-build")
  console.log("buildFolder", buildFolder)
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

  describe("When not already built", () => {
    it("should trigger build step", async () => {
      console.log("Starting not built...")
      await prod(prodArgs)
      expect(mocks.build.build.mock.calls).toEqual([[prodArgs]])
    })
  })

  describe("When already built", () => {
    it("should not trigger build step", async () => {
      console.log("Starting already built...")
      await ensureDir(buildFolder)
      await writeFile(`${buildFolder}/last-build`, await getInputArtefactsHash())
      await prod(prodArgs)
      expect(mocks.build.build.mock.calls).toEqual([])
    })
  })
})
