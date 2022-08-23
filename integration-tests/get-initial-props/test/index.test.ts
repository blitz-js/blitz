import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {killApp, findPort, launchApp, nextBuild, nextStart} from "../../utils/next-test-utils"
import webdriver from "../../utils/next-webdriver"

import {join} from "path"

let app: any
let appPort: number
const appDir = join(__dirname, "../")

const runTests = (mode?: string) => {
  describe("getInitialProps", () => {
    it(
      "should render a custom prop provided in getInitialProps in _app.tsx",
      async () => {
        const browser = await webdriver(appPort, "/")
        await browser.waitForElementByCss("#content", 0)
        const text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/_app.tsx: testing getInitialProps/)
        if (browser) await browser.close()
      },
      5000 * 60 * 2,
    )
    it(
      "should render custom props provided in getInitialProps in both _app.tsx and index.tsx",
      async () => {
        const browser = await webdriver(appPort, "/")
        await browser.waitForElementByCss("#content", 0)
        const text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/_app.tsx: testing getInitialProps/)
        expect(text).toMatch(/index.tsx: testing getInitialProps/)
        if (browser) await browser.close()
      },
      5000 * 60 * 2,
    )
  })
}

describe("getInitialProps Tests", () => {
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
