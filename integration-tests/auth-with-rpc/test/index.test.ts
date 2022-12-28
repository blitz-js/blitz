import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {
  killApp,
  findPort,
  runBlitzCommand,
  blitzLaunchApp,
  blitzBuild,
  blitzStart,
  waitFor,
} from "../../utils/next-test-utils"
import webdriver from "../../utils/next-webdriver"

let app: any
let appPort: number

const runTests = () => {
  describe("Auth", () => {
    describe("custom plugin", () => {
      it("custom plugin - events", async () => {
        const browser = await webdriver(appPort, "/custom-plugin")
        let text = await browser.elementByCss("#page").text()
        await waitFor(250)
        text = await browser.elementByCss("#page").text()
        expect(text).toBe("Custom plugin Session Created")
        await waitFor(2000)
        text = await browser.elementByCss("#page").text()
        expect(text).toBe("Custom plugin RPC Error")
        if (browser) {
          await browser.close()
        }
      })
      it("custom plugin - middleware", async () => {
        const browser = await webdriver(appPort, "/custom-plugin")
        await waitFor(100)
        let text = await browser.elementByCss("#before-req").text()
        expect(text).toBe("customHeaderValue")
        await waitFor(1000)
        text = await browser.elementByCss("#before-res").text()
        expect(text).toBe("55")
        if (browser) {
          await browser.close()
        }
      })
    })
    describe("unauthenticated", () => {
      it("should render result for open query", async () => {
        const browser = await webdriver(appPort, "/noauth-query")
        let text = await browser.elementByCss("#page").text()
        await browser.waitForElementByCss("#content")
        text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/noauth-basic-result/)
        if (browser) await browser.close()
      })

      it("should render error for protected query", async () => {
        const browser = await webdriver(appPort, "/authenticated-query")
        await browser.waitForElementByCss("#error")
        let text = await browser.elementByCss("#error").text()
        expect(text).toMatch(/AuthenticationError/)
        if (browser) await browser.close()
      })

      it("should render error for protected page", async () => {
        const browser = await webdriver(appPort, "/page-dot-authenticate")
        await browser.waitForElementByCss("#error")
        let text = await browser.elementByCss("#error").text()
        expect(text).toMatch(/AuthenticationError/)
        if (browser) await browser.close()
      })

      it("should render error for protected layout", async () => {
        const browser = await webdriver(appPort, "/layout-authenticate")
        await browser.waitForElementByCss("#error")
        let text = await browser.elementByCss("#error").text()
        expect(text).toMatch(/AuthenticationError/)
        if (browser) await browser.close()
      })

      it("should render Page.authenticate = false even when Layout.authenticate = true", async () => {
        const browser = await webdriver(appPort, "/layout-unauthenticate")
        await browser.waitForElementByCss("#content")
        let text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/this should be rendered/)
        if (browser) await browser.close()
      })
    })

    describe("authenticated", () => {
      it("should login and out successfully", async () => {
        const browser = await webdriver(appPort, "/login")
        await browser.waitForElementByCss("#content")
        let text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/logged-out/)
        await browser.elementByCss("#login").click()
        await waitFor(200)
        text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/logged-in/)
        await browser.elementByCss("#logout").click()
        await waitFor(250)
        text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/logged-out/)

        if (browser) await browser.close()
      })

      it("should logout without infinite loop #2233", async () => {
        // Login
        let browser = await webdriver(appPort, "/login")
        await waitFor(200)
        await browser.elementByCss("#login").click()
        await waitFor(200)

        await browser.eval(`window.location = "/authenticated-query"`)
        await browser.waitForElementByCss("#content")
        let text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/authenticated-basic-result/)
        await browser.elementByCss("#logout").click()
        await waitFor(200)
        await browser.waitForElementByCss("#error")
        text = await browser.elementByCss("#error").text()
        expect(text).toMatch(/AuthenticationError/)
        if (browser) await browser.close()
      })

      it("Page.authenticate = {redirect} should work ", async () => {
        // Login
        let browser = await webdriver(appPort, "/login")
        await waitFor(200)
        await browser.elementByCss("#login").click()
        await waitFor(200)

        await browser.eval(`window.location = "/page-dot-authenticate-redirect"`)
        await browser.waitForElementByCss("#content")
        let text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/authenticated-basic-result/)
        await browser.elementByCss("#logout").click()
        await waitFor(500)

        expect(await browser.url()).toMatch(/\/login/)
        if (browser) await browser.close()
      })

      it("Layout.authenticate = {redirect} should work ", async () => {
        // Login
        let browser = await webdriver(appPort, "/login")
        await waitFor(200)
        await browser.elementByCss("#login").click()
        await waitFor(200)

        await browser.eval(`window.location = "/layout-authenticate-redirect"`)
        await browser.waitForElementByCss("#content")
        let text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/authenticated-basic-result/)
        await browser.elementByCss("#logout").click()
        await waitFor(500)

        expect(await browser.url()).toMatch(/\/login/)
        if (browser) await browser.close()
      })
    })

    describe("prefetching", () => {
      it("should prefetch from the query cache #2281", async () => {
        const browser = await webdriver(appPort, "/prefetching")
        await waitFor(100)
        await browser.waitForElementByCss("#content")
        const text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/noauth-basic-result/)
        if (browser) await browser.close()
      })
    })

    describe("setting public data for a user", () => {
      it("should update all sessions of the user", async () => {
        // Ensure logged out
        const browser = await webdriver(appPort, "/login")
        await waitFor(200)
        let text = await browser.elementByCss("#content").text()
        if (text.match(/logged-in/)) {
          await browser.elementByCss("#logout").click()
          await waitFor(200)
        }

        await browser.eval(`window.location = "/set-public-data"`)
        await browser.waitForElementByCss("#change-role")
        await browser.elementByCss("#change-role").click()
        await waitFor(500)
        await browser.waitForElementByCss(".role")
        text = await browser.elementByCss(".role").text()
        expect(text).toMatch(/role: new role/)
        if (browser) await browser.close()
      })
    })

    describe("Page.redirectAuthenticatedTo", () => {
      it("should work when redirecting to page with useQuery", async () => {
        // https://github.com/blitz-js/legacy-framework/issues/2527

        // Ensure logged in
        const browser = await webdriver(appPort, "/login")
        await waitFor(200)
        let text = await browser.elementByCss("#content").text()
        if (text.match(/logged-out/)) {
          await browser.elementByCss("#login").click()
          await waitFor(200)
        }

        await browser.eval(`window.location = "/redirect-authenticated"`)
        await browser.waitForElementByCss("#content")
        text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/authenticated-basic-result/)
        if (browser) await browser.close()
      })
    })

    describe("Layout.redirectAuthenticatedTo", () => {
      it("should work when redirecting to page with useQuery", async () => {
        // https://github.com/blitz-js/legacy-framework/issues/2527

        // Ensure logged in
        const browser = await webdriver(appPort, "/login")
        await waitFor(200)
        let text = await browser.elementByCss("#content").text()
        if (text.match(/logged-out/)) {
          await browser.elementByCss("#login").click()
          await waitFor(200)
        }

        await browser.eval(`window.location = "/layout-redirect-authenticated"`)
        await browser.waitForElementByCss("#content")
        text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/authenticated-basic-result/)
        if (browser) await browser.close()
      })
    })

    describe("setPublicData", () => {
      it("it should not throw CSRF error", async () => {
        // https://github.com/blitz-js/legacy-framework/issues/2448

        // ensure logged out
        const browser = await webdriver(appPort, "/login")
        await waitFor(200)
        let text = await browser.elementByCss("#content").text()
        if (text.match(/logged-in/)) {
          await browser.elementByCss("#logout").click()
          await waitFor(200)
        }

        await browser.eval(`window.location = "/gssp-setpublicdata"`)
        await browser.waitForElementByCss("#content")
        text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/it works/)
        if (browser) await browser.close()
      })
    })
  })
}

describe("Auth Tests", () => {
  describe("dev mode", () => {
    beforeAll(async () => {
      try {
        await runBlitzCommand(["prisma", "migrate", "reset", "--force"])
        appPort = await findPort()
        app = await blitzLaunchApp(appPort, {cwd: process.cwd()})
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
        await runBlitzCommand(["prisma", "generate"])
        await runBlitzCommand(["prisma", "migrate", "deploy"])
        await blitzBuild()
        appPort = await findPort()
        app = await blitzStart(appPort, {cwd: process.cwd()})
      } catch (err) {
        console.log(err)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))

    runTests()
  })
})
