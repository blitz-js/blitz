/* eslint-env jest */
import {findPort, killApp, launchApp, renderViaHTTP, waitFor} from "lib/blitz-test-utils"
import webdriver from "lib/next-webdriver"
import {join} from "path"

const context: any = {}
jest.setTimeout(1000 * 60 * 5)

describe("Queries", () => {
  beforeAll(async () => {
    context.appPort = await findPort()
    context.server = await launchApp(join(__dirname, "../"), context.appPort, {
      env: {__NEXT_TEST_WITH_DEVTOOL: 1},
    })

    const prerender = ["/use-query", "/invalidate"]
    await Promise.all(prerender.map((route) => renderViaHTTP(context.appPort, route)))
  })
  afterAll(() => killApp(context.server))

  describe("useQuery", () => {
    it("should render query result", async () => {
      const browser = await webdriver(context.appPort, "/use-query")
      let text = await browser.elementByCss("#page").text()
      expect(text).toMatch(/Loading/)
      await browser.waitForElementByCss("#content")
      text = await browser.elementByCss("#content").text()
      if (browser) await browser.close()
      expect(text).toMatch(/basic-result/)
    })
  })

  describe("invalidateQuery", () => {
    it("should invalidate the query", async () => {
      const browser = await webdriver(context.appPort, "/invalidate")
      await browser.waitForElementByCss("#content")
      let text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/0/)
      await browser.elementByCss("button").click()
      waitFor(500)
      text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/1/)

      if (browser) await browser.close()
    })
  })
})
