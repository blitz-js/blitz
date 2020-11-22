/* eslint-disable import/first */

import {resolve} from "path"
import {multiMock} from "./utils/multi-mock"

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

// Import with mocks applied
import {ensureDir,writeFile} from "fs-extra"
import {getInputArtifacts} from "../src/build-hash"
import {prod} from "../src/prod"

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

  describe("When not already built", () => {
    it("should trigger build step", async () => {
      await prod(prodArgs)
      expect(mocks.build.build.mock.calls).toEqual([[prodArgs]])
    })
  })

  describe("When already built", () => {
    it("should not trigger build step", async () => {
      await ensureDir(buildFolder)
      await writeFile(`${buildFolder}/last-build.json`, JSON.stringify(await getInputArtifacts()))
      await prod(prodArgs)
      expect(mocks.build.build.mock.calls).toEqual([])
    })
  })
})
