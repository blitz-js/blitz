import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {
  killApp,
  findPort,
  runBlitzCommand,
  blitzLaunchApp,
  blitzBuild,
  blitzStart,
} from "../../utils/next-test-utils"
import webdriver from "../../utils/next-webdriver"

let app: any
let appPort: number

const runTests = () => {
  describe("get query data", () => {
    it(
      "should work",
      async () => {
        const browser = await webdriver(appPort, "/page-with-get-query-data")

        browser.waitForElementByCss("#button", 0)
        await browser.elementByCss("#button").click()

        browser.waitForElementByCss("#new-data", 0)
        const newText = await browser.elementByCss("#new-data").text()
        expect(newText).toMatch(/basic-result/)

        if (browser) await browser.close()
      },
      5000 * 60 * 2,
    )
  })

  describe("prefetch infinite query", () => {
    it(
      "should work",
      async () => {
        const browser = await webdriver(appPort, "/page-with-prefetch-inf-query")

        browser.waitForElementByCss("#data", 0)
        const newText = await browser.elementByCss("#data").text()
        expect(newText).not.toMatch("no-data")
        expect(newText).toMatch("thanks")

        if (browser) await browser.close()
      },
      5000 * 60 * 2,
    )
  })

  describe("invalidate query", () => {
    it(
      "should work",
      async () => {
        const browser = await webdriver(appPort, "/page-with-invalidate")
        const getData = async () => {
          const q1 = await browser.elementByCss("#data-first").text()
          const q2 = await browser.elementByCss("#data-second").text()

          return {q1: parseInt(q1), q2: parseInt(q2)}
        }

        browser.waitForElementByCss("#data", 0)

        const initialData = await getData()
        expect(initialData.q1).equal(0)
        expect(initialData.q2).equal(0)

        browser.elementByCss("#invalidate-both").click() // sometimes first one returns the same value
        await new Promise((r) => setTimeout(r, 100))
        browser.elementByCss("#invalidate-both").click()

        browser.waitForElementByCss("#data", 0)

        const bothData = await getData()
        expect(bothData.q1).greaterThan(initialData.q1)
        expect(bothData.q2).greaterThan(initialData.q2)

        browser.elementByCss("#invalidate-first").click()
        browser.waitForElementByCss("#data", 0)

        const afterSecond = await getData()
        expect(afterSecond.q1).equal(bothData.q1 + 1)
        expect(afterSecond.q2).equal(bothData.q2)

        if (browser) await browser.close()
      },
      5000 * 60 * 2,
    )
  })
}

describe("React Query Utils Tests", () => {
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
