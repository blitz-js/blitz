/* eslint-env jest */
import {findPort, killApp, launchApp, renderViaHTTP} from "lib/blitz-test-utils"
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

    const prerender = ["/image-ssr"]
    await Promise.all(prerender.map((route) => renderViaHTTP(context.appPort, route)))
  })
  afterAll(() => killApp(context.server))

  describe("Image with SSR for configured domains", () => {
    it("should build and render correctly", async () => {
      const browser = await webdriver(context.appPort, "/image-ssr")
      await browser.waitForElementByCss("#avatar")
      const src = await browser.elementById("avatar").getAttribute("src")
      expect(src).toContain("github-cover-photo.png")
      if (browser) await browser.close()
    })
  })
})
