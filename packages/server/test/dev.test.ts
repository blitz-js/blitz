/* eslint-disable import/first */

import {join, resolve} from "path"
import * as blitzVersion from "../src/blitz-version"
import {multiMock} from "./utils/multi-mock"

const mocks = multiMock(
  {
    "next-utils": {
      nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
      nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
      customServerExists: jest.fn().mockReturnValue(false),
    },
    "resolve-bin-async": {
      resolveBinAsync: jest.fn().mockImplementation((...a) => join(...a)), // just join the paths
    },
    "blitz-version": {
      getBlitzVersion: jest.fn().mockReturnValue(blitzVersion.getBlitzVersion()),
      isVersionMatched: jest.fn().mockImplementation(blitzVersion.isVersionMatched),
      saveBlitzVersion: jest.fn().mockImplementation(blitzVersion.saveBlitzVersion),
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
import {dev} from "../src/dev"
import {Manifest} from "../src/stages/manifest"
import {directoryTree} from "./utils/tree-utils"

const originalLog = console.log
describe("Dev command", () => {
  let rootFolder: string
  let buildFolder: string
  let consoleOutput: string[] = []
  const mockedLog = (output: string) => consoleOutput.push(output)

  beforeEach(() => {
    console.log = mockedLog
    jest.clearAllMocks()
  })

  afterEach(() => {
    console.log = originalLog
  })

  describe("throw in nextStartDev", () => {
    beforeEach(() => {
      mocks["next-utils"].nextStartDev.mockRejectedValue("pow")
      mocks["blitz-version"].getBlitzVersion.mockRejectedValue("pow")
      mocks["blitz-version"].isVersionMatched.mockRejectedValue("pow")
      mocks["blitz-version"].saveBlitzVersion.mockRejectedValue("pow")
    })

    afterEach(() => {
      mocks["next-utils"].nextStartDev.mockReturnValue(Promise.resolve())
      mocks["blitz-version"].getBlitzVersion.mockReturnValue(blitzVersion.getBlitzVersion())
      mocks["blitz-version"].isVersionMatched.mockImplementation(blitzVersion.isVersionMatched)
      mocks["blitz-version"].saveBlitzVersion.mockImplementation(blitzVersion.saveBlitzVersion)
    })

    it("should blow up", async () => {
      const transformFiles = () => Promise.resolve({manifest: Manifest.create()})
      try {
        await dev({
          transformFiles,
          rootFolder: "",
          writeManifestFile: false,
          watch: false,
          port: 3000,
          hostname: "localhost",
          env: "dev",
        })
      } catch (err) {
        expect(err).toBe("pow")
      }
    })
  })

  describe("when run normally", () => {
    beforeEach(() => {
      rootFolder = resolve("dev")
      buildFolder = resolve(rootFolder, ".blitz-build")
    })
    afterEach(() => {
      mocks.mockFs.restore()
    })

    it("should copy the correct files to the dev folder", async () => {
      mocks.mockFs({
        "dev/.git/hooks": "",
        "dev/.vercel/project.json": "",
        "dev/one": "",
        "dev/two": "",
        "dev/.blitz-build/_manifest.json": JSON.stringify({keys: {}, values: {}}),
      })
      await dev({
        rootFolder,
        buildFolder,
        writeManifestFile: false,
        watch: false,
        port: 3000,
        hostname: "localhost",
        env: "dev",
      })
      expect(directoryTree(rootFolder)).toEqual({
        children: [
          {
            children: [{name: "_blitz-version.txt"}, {name: "one"}, {name: "two"}],
            name: ".blitz-build",
          },
          {
            children: [
              {
                name: "hooks",
              },
            ],
            name: ".git",
          },
          {
            children: [
              {
                name: "project.json",
              },
            ],
            name: ".vercel",
          },
          {name: "one"},
          {name: "two"},
        ],
        name: "dev",
      })
    })

    it("calls spawn with the patched next cli bin", async () => {
      mocks.mockFs(
        {
          "dev/@blitzjs/server/next-patched": "",
          "dev/.blitz-build/_manifest.json": JSON.stringify({keys: {}, values: {}}),
        },
        {createCwd: false, createTmp: false},
      )
      await dev({
        rootFolder,
        buildFolder,
        writeManifestFile: false,
        watch: false,
        port: 3000,
        hostname: "localhost",
        env: "dev",
      })
      const nextPatched = resolve(rootFolder, "@blitzjs/server", "next-patched")
      const blitzBuild = join(rootFolder, ".blitz-build")
      expect(mocks["next-utils"].nextStartDev.mock.calls[0].length).toBe(5)
      expect(mocks["next-utils"].nextStartDev.mock.calls[0][0]).toBe(nextPatched)
      expect(mocks["next-utils"].nextStartDev.mock.calls[0][1]).toBe(blitzBuild)
      expect(mocks["next-utils"].nextStartDev.mock.calls[0][4]).toHaveProperty("port")
      expect(mocks["next-utils"].nextStartDev.mock.calls[0][4]).toHaveProperty("hostname")
    })
  })
})
