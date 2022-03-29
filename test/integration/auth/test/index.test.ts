import {describe, it, expect, beforeAll, afterAll, vi} from "vitest"
import {
  blitzBuild,
  blitzExport,
  blitzStart,
  File,
  findPort,
  killApp,
  launchApp,
  renderViaHTTP,
  waitFor,
  fetchViaHTTP,
} from "./next-test-utils"
import webdriver from "./next-webdriver"
import {join} from "path"
import rimraf from "rimraf"

let app: any
let appPort: number
const appDir = join(__dirname, "..")
const outdir = join(appDir, "out")
const blitzConfig = new File(join(appDir, "blitz.config.ts"))

const runTests = (mode: string) => {
  describe("Auth", () => {
    describe("unauthenticated", () => {
      it("should render error for protected query", async () => {
        const browser = await webdriver(appPort, "/authenticated-page")
        let errorMsg = await browser.elementByXpath(`//*[@id="__next"]/div`)
        expect(errorMsg).toMatch(/Error: You are not authenticated/)
        if (browser) browser.close()
      })

      it("should render result for open query", async () => {
        const res = await fetchViaHTTP(appPort, "/api/noauth", {
          method: "GET",
          headers: {"Content-Type": "application/json; charset=utf-8"},
        })

        expect(res.status).toBe(200)
      })
    })
  })
}

describe("dev mode", () => {
  beforeAll(async () => {
    // rimraf.sync(join(__dirname, "../db/index.ts"))
    appPort = await findPort()
    app = await launchApp(appDir, appPort)
  }, 1000 * 60 * 2)
  afterAll(() => killApp(app))
  runTests("dev")
})
