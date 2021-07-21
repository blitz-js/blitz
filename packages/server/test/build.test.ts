/* eslint-disable import/first */
import {resolve} from "path"
import * as blitzVersion from "../src/blitz-version"
import {multiMock} from "./utils/multi-mock"

const mocks = multiMock(
  {
    "next-utils": {
      customServerExists: jest.fn().mockReturnValue(Boolean),
      buildCustomServer: jest.fn().mockReturnValue(Promise.resolve()),
      nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
    },
    "resolve-bin-async": {
      resolveBinAsync: jest.fn().mockReturnValue(Promise.resolve("")),
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
import {build} from "../src/build"
import {directoryTree} from "./utils/tree-utils"

describe("Build command", () => {
  const rootFolder = resolve("build")
  const buildFolder = resolve(rootFolder, ".blitz-build")

  beforeEach(async () => {
    mocks.mockFs({
      "build/.git/hooks": "",
      "build/.vercel/project.json": "",
      "build/one": "",
      "build/two": "",
      "build/.next": "",
    })
    jest.clearAllMocks()
    await build({
      rootFolder,
      buildFolder,
      writeManifestFile: false,
      port: 3000,
      hostname: "localhost",
      env: "prod",
    })
  })

  afterEach(() => {
    mocks.mockFs.restore()
  })

  it("should copy the correct files to the build folder", () => {
    expect(directoryTree(rootFolder)).toEqual({
      children: [
        {
          children: [{name: ".next"}, {name: "_blitz-version.txt"}, {name: "one"}, {name: "two"}],
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
        {name: ".next"},
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
      name: "build",
    })
  })
})
