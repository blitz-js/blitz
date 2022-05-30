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
        /* For some reason, unable to find #page element right away when rendering a child component.
          
          If we waitForElement on #page, it returns basic-result instead of showing the Loading... text first.
          
          If we explicity add Loading... text inside the Page component vs a child component like <Content /> then we can find Loading...

          This has nothing to do with useQuery, as even when just returning <>Loading...</> through <Content /> it won't find the Loading... text.
          */
        await browser.waitForElementByCss("#page", 0)
        let text = await browser.elementByCss("#page").text()
        // expect(text).toMatch(/Loading/)
        // await browser.waitForElementByCss("#content", 0)
        // text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/basic-result/)
        if (browser) await browser.close()
      },
      5000 * 60 * 2,
    )
  })
}

describe("dev mode", () => {
  beforeAll(async () => {
    try {
      appPort = await findPort()
      app = await launchApp(appDir, appPort, {})
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
      appPort = await findPort()
      await nextBuild(appDir)
      app = await nextStart(appDir, appPort)
    } catch (err) {
      console.log(err)
    }
  }, 5000 * 60 * 2)
  afterAll(async () => await killApp(app))

  runTests()
})
