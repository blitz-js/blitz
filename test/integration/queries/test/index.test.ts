import {
  blitzBuild,
  blitzStart,
  File,
  findPort,
  killApp,
  launchApp,
  renderViaHTTP,
} from "blitz-test-utils"
import cheerio from "cheerio"
import {join} from "path"

jest.setTimeout(1000 * 60 * 5)
let app: any
let appPort: number
const appDir = join(__dirname, "..")
const blitzConfig = new File(join(appDir, "blitz.config.js"))

const runTests = () => {
  it("should have gip in __NEXT_DATA__", async () => {
    const html = await renderViaHTTP(appPort, "/")
    const $ = cheerio.load(html)
    expect(JSON.parse($("#__NEXT_DATA__").text()).gip).toBe(true)
  })

  it("should not have gip in __NEXT_DATA__ for non-GIP page", async () => {
    const html = await renderViaHTTP(appPort, "/normal")
    const $ = cheerio.load(html)
    expect("gip" in JSON.parse($("#__NEXT_DATA__").text())).toBe(false)
  })

  it("should have correct router.asPath for direct visit dynamic page", async () => {
    const html = await renderViaHTTP(appPort, "/blog/1")
    const $ = cheerio.load(html)
    expect($("#as-path").text()).toBe("/blog/1")
  })

  it("should have correct router.asPath for direct visit dynamic page rewrite direct", async () => {
    const html = await renderViaHTTP(appPort, "/blog/post/1")
    const $ = cheerio.load(html)
    expect($("#as-path").text()).toBe("/blog/post/1")
  })
}

describe("getInitialProps", () => {
  describe("dev mode", () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })

  describe("serverless mode", () => {
    beforeAll(async () => {
      blitzConfig.replace("// replace me", `target: 'serverless', `)
      await blitzBuild(appDir)
      appPort = await findPort()
      app = await blitzStart(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
      blitzConfig.restore()
    })

    runTests()
  })

  describe("production mode", () => {
    beforeAll(async () => {
      await blitzBuild(appDir)
      appPort = await findPort()
      app = await blitzStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })
})
