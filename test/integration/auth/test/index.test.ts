/* eslint-env jest */
import {findPort, killApp, launchApp, renderViaHTTP} from "lib/blitz-test-utils"
import webdriver from "lib/next-webdriver"
import {join} from "path"
import rimraf from "rimraf"

const context: any = {}
jest.setTimeout(1000 * 60 * 5)

describe("Auth", () => {
  beforeAll(async () => {
    rimraf.sync(join(__dirname, "../db.json"))

    context.appPort = await findPort()
    context.server = await launchApp(join(__dirname, "../"), context.appPort, {
      env: {__NEXT_TEST_WITH_DEVTOOL: 1},
    })

    const prerender = ["/noauth-query", "/authenticated-query"]
    await Promise.all(prerender.map((route) => renderViaHTTP(context.appPort, route)))
  })
  afterAll(() => killApp(context.server))

  describe("no-auth query", () => {
    it("should render query result", async () => {
      const browser = await webdriver(context.appPort, "/noauth-query")
      let text = await browser.elementByCss("#page").text()
      expect(text).toMatch(/Loading/)
      await browser.waitForElementByCss("#content")
      text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/noauth-basic-result/)
      if (browser) await browser.close()
    })
  })

  describe("authenticated query", () => {
    it("should render error", async () => {
      const browser = await webdriver(context.appPort, "/authenticated-query")
      let text = await browser.elementByCss("#page").text()
      expect(text).toMatch(/Loading/)
      await browser.waitForElementByCss("#error")
      text = await browser.elementByCss("#error").text()
      expect(text).toMatch(/AuthenticationError/)
      if (browser) await browser.close()
    })
  })
})
