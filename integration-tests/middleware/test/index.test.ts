import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {
  killApp,
  findPort,
  launchApp,
  nextBuild,
  nextStart,
  fetchViaHTTP,
} from "../../utils/next-test-utils"
import {join} from "path"

let app: any
let appPort: number
const appDir = join(__dirname, "../")

const runTests = () => {
  describe("Middleware", () => {
    describe("global middleware", () => {
      it(
        "should call global middleware on api calls",
        async () => {
          const res = await fetchViaHTTP(appPort, "/api/test", null, {
            method: "GET",
          })
          expect(res.headers.get("global-middleware")).toBe("true")
        },
        5000 * 60 * 2,
      )

      it(
        "should call global middleware on rpc calls",
        async () => {
          const res = await fetchViaHTTP(appPort, "/api/rpc/getBasic", null, {
            method: "GET",
          })
          expect(res.headers.get("global-middleware")).toBe("true")
        },
        5000 * 60 * 2,
      )
    })
  })
}

describe("Middleware Tests", () => {
  describe("dev mode", () => {
    beforeAll(async () => {
      try {
        appPort = await findPort()
        app = await launchApp(appDir, appPort, {cwd: process.cwd()})
      } catch (error) {
        console.log(error)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))
    runTests()
  })

  describe("server mode", () => {
    beforeAll(async () => {
      try {
        await nextBuild(appDir)
        appPort = await findPort()
        app = await nextStart(appDir, appPort, {cwd: process.cwd()})
      } catch (err) {
        console.log(err)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))

    runTests()
  })
})
