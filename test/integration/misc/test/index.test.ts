/* eslint-env jest */
import {
  blitzBuild,
  blitzExport,
  findPort,
  killApp,
  launchApp,
  renderViaHTTP,
} from "lib/blitz-test-utils"
import webdriver from "lib/next-webdriver"
import {join} from "path"

const context: any = {}
jest.setTimeout(1000 * 60 * 5)

describe("Misc", () => {
  beforeAll(async () => {
    context.appPort = await findPort()
    context.server = await launchApp(join(__dirname, "../"), context.appPort, {
      env: {__NEXT_TEST_WITH_DEVTOOL: 1},
    })

    const prerender = ["/body-parser", "/script"]
    await Promise.all(prerender.map((route) => renderViaHTTP(context.appPort, route)))
  })
  afterAll(() => killApp(context.server))

  describe("body parser config", () => {
    it("should not render query result", async () => {
      const browser = await webdriver(context.appPort, "/body-parser")
      await browser.waitForElementByCss("#error")
      let text = await browser.elementByCss("#error").text()
      expect(text).toMatch(/query failed/)
      if (browser) await browser.close()
    })
  })

  describe("Script", () => {
    it("should work", async () => {
      const browser = await webdriver(context.appPort, "/script")

      let scriptLoaded = await browser.eval(`window.scriptLoaded`)
      expect(scriptLoaded).toBe(true)

      if (browser) await browser.close()
    })
  })
})

const appDir = join(__dirname, "../")
const outdir = join(appDir, "out")

describe("blitz export", () => {
  it("should export successfully", async () => {
    const {code} = await blitzBuild(appDir)
    if (code !== 0) throw new Error(`export failed with status ${code}`)
    const {code: exportCode} = await blitzExport(appDir, {outdir})
    if (exportCode !== 0) throw new Error(`export failed with status ${exportCode}`)
  })
})
