import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {
  killApp,
  findPort,
  launchApp,
  nextBuild,
  nextStart,
  runBlitzCommand,
} from "../../utils/next-test-utils"
import webdriver from "../../utils/next-webdriver"

import {join} from "path"

let app: any
let appPort: number
const appDir = join(__dirname, "../")

const runTests = (mode?: string) => {
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
}
describe("React Query Utils Tests", () => {
  describe("dev mode", () => {
    beforeAll(async () => {
      try {
        await runBlitzCommand(["prisma", "migrate", "reset", "--force"])
        appPort = await findPort()
        app = await launchApp(appPort, {cwd: process.cwd()})
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
        await nextBuild()
        appPort = await findPort()
        app = await nextStart(appPort, {cwd: process.cwd()})
      } catch (err) {
        console.log(err)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))

    runTests()
  })
})
