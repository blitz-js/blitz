/* eslint-env jest */
import fs from "fs-extra"
import {
  blitzBuild,
  blitzExport,
  findPort,
  killApp,
  launchApp,
  renderViaHTTP,
  waitFor,
} from "lib/blitz-test-utils"
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

    const prerender = [
      "/login",
      "/noauth-query",
      "/authenticated-query",
      "/api/queries/getNoauthBasic",
      "/api/queries/getAuthenticatedBasic",
      "/api/mutations/login",
      "/api/mutations/logout",
    ]
    await Promise.all(prerender.map((route) => renderViaHTTP(context.appPort, route)))
  })
  afterAll(() => killApp(context.server))

  describe("unauthenticated", () => {
    it("should render result for open query", async () => {
      const browser = await webdriver(context.appPort, "/noauth-query")
      let text = await browser.elementByCss("#page").text()
      await browser.waitForElementByCss("#content")
      text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/noauth-basic-result/)
      if (browser) await browser.close()
    })

    it("should render error for protected query", async () => {
      const browser = await webdriver(context.appPort, "/authenticated-query")
      await browser.waitForElementByCss("#error")
      let text = await browser.elementByCss("#error").text()
      expect(text).toMatch(/AuthenticationError/)
      if (browser) await browser.close()
    })
  })

  describe("authenticated", () => {
    it("should login and out successfully", async () => {
      const browser = await webdriver(context.appPort, "/login")
      await browser.waitForElementByCss("#content")
      let text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/logged-out/)
      await browser.elementByCss("#login").click()
      await waitFor(100)
      text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/logged-in/)
      await browser.elementByCss("#logout").click()
      await waitFor(100)
      text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/logged-out/)

      if (browser) await browser.close()
    })

    it("should logout without infinite loop #2233", async () => {
      // Login
      let browser = await webdriver(context.appPort, "/login")
      await browser.elementByCss("#login").click()

      browser = await webdriver(context.appPort, "/authenticated-query")
      await browser.waitForElementByCss("#content")
      let text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/authenticated-basic-result/)
      await browser.elementByCss("#logout").click()
      await waitFor(100)
      await browser.waitForElementByCss("#error")
      text = await browser.elementByCss("#error").text()
      expect(text).toMatch(/AuthenticationError/)
      if (browser) await browser.close()
    })
  })

  describe("prefetching", () => {
    it("should login successfully", async () => {
      const browser = await webdriver(context.appPort, "/login")
      await browser.waitForElementByCss("#content")
      let text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/logged-out/)
      await browser.elementByCss("#login").click()
      await waitFor(100)
      text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/logged-in/)

      if (browser) await browser.close()
    })

    it("should prefetch from the query cache #2281", async () => {
      const browser = await webdriver(context.appPort, "/prefetching", true)
      await browser.waitForElementByCss("#content")
      const text = await browser.elementByCss("#content").text()
      expect(text).toMatch(/authenticated-basic-result/)
      if (browser) await browser.close()
    })
  })
})

const appDir = join(__dirname, "../")
const outdir = join(appDir, "out")

describe("auth - blitz export should not work", () => {
  it("should build successfully", async () => {
    await fs.remove(join(appDir, ".next"))
    const {code} = await blitzBuild(appDir)
    if (code !== 0) throw new Error(`build failed with status ${code}`)
  })

  it("should have error during blitz export", async () => {
    const {stderr} = await blitzExport(appDir, {outdir}, {stderr: true})
    expect(stderr).toContain("Blitz sessionMiddleware is not compatible with `blitz export`.")
  })
})
