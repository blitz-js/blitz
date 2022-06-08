import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {killApp, findPort, launchApp, nextBuild, nextStart} from "../../utils/next-test-utils"
import webdriver from "../../utils/next-webdriver"

import {join} from "path"

let app: any
let appPort: number
const appDir = join(__dirname, "../")

const runTests = (mode?: string) => {
  describe("useQuery without suspense", () => {
    it(
      "should render query result",
      async () => {
        const browser = await webdriver(appPort, "/use-query")

        let text
        browser.waitForElementByCss("#content", 0)
        text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/basic-result/)
        if (browser) await browser.close()
      },
      5000 * 60 * 2,
    )
  })
}

describe("No Suspense Tests", () => {
  describe("dev mode", () => {
    beforeAll(async () => {
      try {
        appPort = await findPort()
        app = await launchApp(appDir, appPort, {cwd: process.cwd()})
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
        await nextBuild(appDir)
        appPort = await findPort()
        app = await nextStart(appDir, appPort, {cwd: process.cwd()})
      } catch (err) {
        console.log(err)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))

    runTests()
  })
})
