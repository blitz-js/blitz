/* eslint-disable import/first */

import {resolve} from "path"
import {multiMock} from "./utils/multi-mock"
const mocks = multiMock(
  {
    "next-utils": {
      nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
      nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
      customServerExists: jest.fn().mockReturnValue(false),
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
import {dev} from "../src/dev"
import {directoryTree} from "./utils/tree-utils"

describe("Dev command", () => {
  const rootFolder = resolve("")
  const buildFolder = resolve(rootFolder, ".blitz-build")

  beforeEach(async () => {
    mocks.mockFs({
      "app/posts/pages/foo.tsx": "",
      "pages/bar.tsx": "",
      ".blitz-build/_manifest.json": JSON.stringify({keys: {}, values: {}}),
    })
    jest.clearAllMocks()
    await dev({
      rootFolder,
      buildFolder,
      writeManifestFile: false,
      watch: false,
      port: 3000,
      hostname: "localhost",
      env: "dev",
    })
  })

  afterEach(() => {
    mocks.mockFs.restore()
  })

  it("should copy the correct files to the dev folder", () => {
    expect(directoryTree(buildFolder)).toEqual({
      name: ".blitz-build",
      children: [
        {name: "_blitz-version.txt"},
        {name: "blitz.config.js"},
        {name: "next.config.js"},
        {
          name: "pages",
          children: [{name: "bar.tsx"}, {name: "foo.tsx"}],
        },
      ],
    })
  })
})
