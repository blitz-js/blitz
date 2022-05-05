/* eslint-env jest */
import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {join} from "path"
import {killApp, findPort, launchApp, renderViaHTTP} from "../../utils/next-test-utils"
import webdriver from "../../utils/next-webdriver"

const context = {}
describe("Queries", () => {
  beforeAll(async () => {
    context.appPort = await findPort()
    context.server = await launchApp(join(__dirname, "../"), context.appPort, {
      env: {__NEXT_TEST_WITH_DEVTOOL: 1},
    })

    const prerender = ["/use-query"]
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
      expect(text).toMatch(/basic-result/)
      if (browser) await browser.close()
    })
  })
})
