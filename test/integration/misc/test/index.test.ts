/* eslint-env jest */
import fs from "fs-extra"
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

    const prerender = ["/body-parser"]
    await Promise.all(prerender.map((route) => renderViaHTTP(context.appPort, route)))
  })
  afterAll(() => killApp(context.server))

  describe("body parser config", () => {
    it("should render query result", async () => {
      const browser = await webdriver(context.appPort, "/body-parser")
      let text = await browser.elementByCss("#page").text()
      expect(text).toMatch(/Loading/)
      await browser.waitForElementByCss("#error")
      text = await browser.elementByCss("#error").text()
      expect(text).toMatch(/query failed/)
      if (browser) await browser.close()
    })
  })

  const appDir = join(__dirname, "../")
  const outdir = join(appDir, "out")

  describe("blitz export", () => {
    it("should build successfully", async () => {
      await fs.remove(join(appDir, ".next"))
      const {code} = await blitzBuild(appDir)
      if (code !== 0) throw new Error(`build failed with status ${code}`)
    })

    it("should export successfully", async () => {
      const {code} = await blitzExport(appDir, {outdir})
      if (code !== 0) throw new Error(`export failed with status ${code}`)
    })
  })
})
