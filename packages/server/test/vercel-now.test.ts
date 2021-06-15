/* eslint-disable import/first */
import {resolve} from "path"
import * as blitzVersion from "../src/blitz-version"
import {multiMock} from "./utils/multi-mock"

const mocks = multiMock(
  {
    "next-utils": {
      nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
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

// Import with mocks applied
import {build} from "../src/build"
import {directoryTree} from "./utils/tree-utils"

jest.mock("@blitzjs/config")
import {getConfig} from "@blitzjs/config"
;(getConfig as any).mockImplementation(() => ({}))

describe("Build command Vercel", () => {
  const rootFolder = resolve("")
  const buildFolder = resolve(rootFolder, ".blitz-build")

  beforeEach(async () => {
    process.env.NOW_BUILDER = "1"
    mocks.mockFs({
      "app/posts/pages/foo.tsx": "",
      "pages/bar.tsx": "",
      ".next": "",
      "next.config.js": 'module.exports = {target: "experimental-serverless-trace"}',
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
    delete process.env.NOW_BUILDER
    mocks.mockFs.restore()
  })

  it("should copy the correct files to the build folder", () => {
    expect(directoryTree(buildFolder)).toEqual({
      name: ".blitz-build",
      children: [
        {name: ".next"},
        {name: "_blitz-version.txt"},
        {name: "blitz.config.js"},
        {name: "next-vercel.config.js"},
        {name: "next.config.js"},
        {
          name: "pages",
          children: [{name: "bar.tsx"}, {name: "foo.tsx"}],
        },
      ],
    })
  })
})
