/* eslint-disable import/first */

import {join, normalize, resolve} from "path"
import {multiMock} from "./utils/multi-mock"
const mocks = multiMock(
  {
    "resolve-bin-async": {
      resolveBinAsync: jest.fn().mockImplementation((...a) => join(...a)), // just join the paths
    },
  },
  resolve(__dirname, "../src"),
)

// Import with mocks applied
import {RouteCache} from "@blitzjs/file-pipeline"
import {routes as getRoutes} from "../src/routes"

const originalLog = console.log
describe("Routes command", () => {
  let rootFolder: string
  let buildFolder: string
  let devFolder: string
  let routeFolder: string
  let consoleOutput: string[] = []
  const mockedLog = (output: string) => consoleOutput.push(output)

  beforeEach(() => {
    console.log = mockedLog
    jest.clearAllMocks()
  })

  afterEach(() => {
    console.log = originalLog
  })

  describe("when run normally", () => {
    beforeEach(() => {
      rootFolder = resolve("dev")
      buildFolder = resolve(rootFolder, ".blitz")
      devFolder = resolve(rootFolder, ".blitz-dev")
      routeFolder = resolve(rootFolder, ".blitz-routes")
    })
    afterEach(() => {
      mocks.mockFs.restore()
    })

    it("should not blow up", async () => {
      const transformFiles = () => Promise.resolve({routeCache: RouteCache.create()})
      await getRoutes({
        transformFiles,
        rootFolder: "",
        routeFolder: "",
        writeManifestFile: false,
        watch: false,
        port: 3000,
        hostname: "localhost",
      })
    })

    it("should get the right routes serialization", async () => {
      mocks.mockFs({
        "dev/.git/hooks": "",
        "dev/.vercel/project.json": "",
        "dev/app/api/auth.ts": "",
        "dev/app/auth/pages/login.ts": "",
        "dev/app/products/queries/getProducts.ts": "",
        "dev/app/products/mutations/updateProduct.ts": "",
      })
      const routes = await getRoutes({
        rootFolder,
        buildFolder,
        devFolder,
        routeFolder,
        writeManifestFile: false,
        watch: false,
        port: 3000,
        hostname: "localhost",
      })

      expect(routes).toEqual([
        {path: normalize("app/api/auth.ts"), uri: "/api/auth", type: "api", verb: "*"},
        {path: normalize("app/auth/pages/login.ts"), uri: "/login", type: "page", verb: "get"},
        {
          path: normalize("app/products/mutations/updateProduct.ts"),
          uri: "/api/products/mutations/updateProduct",
          type: "rpc",
          verb: "post",
        },
        {
          path: normalize("app/products/queries/getProducts.ts"),
          uri: "/api/products/queries/getProducts",
          type: "rpc",
          verb: "post",
        },
      ])
    })
  })
})
