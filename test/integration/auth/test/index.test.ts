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
    it("runs", async () => {
      const browser = await webdriver(appPort, "/authenticated-query")
      console.log(browser)
    })
  })
}

describe("dev mode", () => {
  beforeAll(async () => {
    rimraf.sync(join(__dirname, "../db/index.ts"))
    appPort = await findPort()
    app = await launchApp(appDir, appPort)
  }, 1000 * 60 * 2)
  afterAll(() => killApp(app))
  runTests("dev")
})
